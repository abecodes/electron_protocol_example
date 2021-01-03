const {
	app,
	BrowserWindow,
	BrowserView,
	protocol,
	ipcMain,
} = require("electron");

protocol.registerSchemesAsPrivileged([
	{
		scheme: "demoprotocol",
		privileges: {
			bypassCSP: true,
			supportFetchAPI: true,
		},
	},
]);

function createWindow() {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
		},
	});

	win.loadFile("index.html");
	ipcMain.addListener("clear", (args) => {
		win
			.getBrowserView()
			.webContents.executeJavaScript(
				`window.demoprotocol.receive("clear", null)`
			);
	});

	return win;
}

app
	.whenReady()
	.then(createWindow)

	.then((win) => {
		protocol.registerBufferProtocol("demoprotocol", (req, cb) => {
			const url = new URL(req.url);
			const type = url.hostname;

			try {
				const payload = JSON.parse(url.searchParams.get("payload"));

				switch (type) {
					case "focus":
						if (payload.data) {
							win.webContents.send("focus", true);
						} else {
							win.webContents.send("focus", false);
						}
						break;
					case "term":
						win.webContents.send("term", payload.data);
						break;
				}

				cb({
					mimeType: "application/json",
					data: Buffer.from(JSON.stringify({ success: true, msg: payload })),
				});
			} catch (error) {
				cb({
					mimeType: "application/json",
					data: Buffer.from(JSON.stringify({ success: false, msg: error })),
				});
			}
		});

		return win;
	})
	.then((win) => {
		const bv = new BrowserView({
			webPreferences: {
				// absolute path
				preload: app.getAppPath() + "/protocol.js",
			},
		});
		bv.webContents.openDevTools();
		win.setBrowserView(bv);
		bv.setBounds({ x: 0, y: 50, width: 800, height: 550 });
		bv.webContents.loadFile("foogle.html");
	});

app.on("window-all-closed", () => {
	app.quit();
});
