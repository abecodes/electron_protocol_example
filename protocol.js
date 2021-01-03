window.demoprotocol = {
	send: (type, data) =>
		fetch(`demoprotocol://${type}?payload=${JSON.stringify(data)}`, {
			method: "GET",
			// Instead of get and queryparam, one could also use post.
			/* method: "POST",
			body: JSON.stringify({
				data,
			}), */
		}).then((res) => res.json()),
};
