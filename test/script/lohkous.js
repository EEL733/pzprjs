/* lohkous.js */

ui.debug.addDebugData("lohkous", {
	url: "5/5/f2b234m2a31c",
	failcheck: [
		[
			"bkNumGe2",
			"pzprv3/lohkous/5/5/. . . . . /. 2 . 2,3,4 . /. . . . . /. . . . . /. 2 3,1 . . /0 0 0 0 /0 0 0 0 /0 0 1 0 /0 1 1 0 /0 1 0 0 /0 0 0 0 0 /1 1 1 0 0 /1 1 0 0 0 /0 0 0 1 1 /"
		],
		[
			"ceNoNum",
			"pzprv3/lohkous/5/5/. . . . . /. 2 . 2,3,4 . /. . . . . /. . . . . /. 2 3,1 . . /0 1 0 0 /0 1 0 0 /0 0 1 0 /0 1 1 0 /0 1 0 0 /0 0 0 0 0 /1 1 1 0 0 /1 1 0 0 0 /0 0 1 1 1 /"
		],
		[
			"bkUnknown",
			"pzprv3/lohkous/5/5/. . . . . /. 2 . 2,3,4 . /. . . . . /. . . . . /. 2 3,1 . . /0 0 0 0 /0 0 0 0 /0 1 0 0 /0 1 0 0 /0 1 0 0 /0 0 0 0 0 /1 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"
		],
		[
			"nmMissing",
			"pzprv3/lohkous/5/5/. . . . . /. 2 . 2,3,4 . /. . . . . /. . . . . /. 2 3,1 . . /0 0 0 0 /0 0 0 0 /0 1 0 0 /0 1 0 0 /0 1 0 0 /0 0 0 0 0 /0 0 1 1 1 /0 0 0 0 0 /0 0 0 0 0 /"
		],
		[
			"bdUnused",
			"pzprv3/lohkous/5/5/. . . . . /. 2 . 2,3,4 . /. . . . . /. . . . . /. 2 3,1 . . /0 1 0 0 /0 1 0 0 /0 0 1 0 /0 1 1 0 /0 1 0 0 /0 0 0 0 0 /1 1 1 0 1 /1 1 0 0 0 /0 0 0 1 1 /"
		],

		[
			"bdUnused",
			"pzprv3/lohkous/4/4/1,4 . . . /. 2 . . /. . . . /. . . . /0 1 0 /1 0 1 /1 0 1 /0 0 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /",
			{ skiprules: true }
		],
		[
			"nmMissing",
			"pzprv3/lohkous/3/3/. . 3,-,- /. . . /1 . . /0 0 /0 0 /1 0 /0 0 0 /1 0 0 /",
			{ skiprules: true }
		],
		[
			"bkUnknown",
			"pzprv3/lohkous/3/3/. . 1,- /2,1 . . /. . . /0 0 /0 1 /1 0 /1 1 0 /0 1 0 /",
			{ skiprules: true }
		],
		[
			null,
			"pzprv3/lohkous/3/3/. . 1,- /2,1 . . /. . . /0 0 /0 1 /0 0 /1 1 0 /1 1 0 /",
			{ skiprules: true }
		],

		[
			null,
			"pzprv3/lohkous/5/5/. . . . . /. 2 . 2,3,4 . /. . . . . /. . . . . /. 2 3,1 . . /0 1 0 0 /0 1 0 0 /0 0 1 0 /0 1 1 0 /0 1 0 0 /0 0 0 0 0 /1 1 1 0 0 /1 1 0 0 0 /0 0 0 1 1 /"
		]
	],
	inputs: [
		{
			input: ["newboard,2,1", "key,1,2,3"],
			result: "pzprv3/lohkous/1/2/1,2,3 . /0 /"
		},
		{
			input: ["newboard,2,1", "key,1,2,3,1,2"],
			result: "pzprv3/lohkous/1/2/3 . /0 /"
		},
		{
			input: ["newboard,2,1", "key,3,-,2,-"],
			result: "pzprv3/lohkous/1/2/3,-,2,- . /0 /"
		}
	]
});
