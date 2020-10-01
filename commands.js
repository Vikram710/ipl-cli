#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const {
	innings1,
	innings2,
	matchInfo,
	shortInfo,
	pointsTable,
	getScorecard,
	printTable,
	printShortInfo,
	printDetailedInfo,
} = require('./ipl20');

program.version('1.0.0').description('IPL Live Score CLI');

program
	.command('short-info')
	.alias('si')
	.description(`Short info on today's match`)
	.action(async () => {
		let data;
		try {
			data = await shortInfo();
		} catch (err) {
			console.log(err);
		}
		if (data.noIPL) {
			console.log(chalk`{red.bold ${data.message}}`);
		} else {
			printShortInfo(data);
		}
	});

program
	.command('facts')
	.alias('f')
	.description(`Facts on today's match`)
	.action(async () => {
		let data;
		try {
			data = await matchInfo();
		} catch (err) {
			console.log(err);
		}
		if (data.noIPL) {
			console.log(chalk`{red.bold ${data.message}}`);
		} else {
			printDetailedInfo(data);
		}
	});

program
	.command('points-table')
	.alias('pt')
	.description(`IPL points table`)
	.action(async () => {
		let data;
		try {
			data = await pointsTable(process.stdout.columns);
		} catch (err) {
			console.log(err);
		}
		printTable(data.table);
	});

program
	.command('scorecard')
	.alias('sc')
	.description(`Scorecard of Today's match`)
	.action(async () => {
		let html, data;
		try {
			html = await getScorecard();
		} catch (err) {
			console.log(err);
		}
		if (typeof html == 'object') {
			if (html.noIPL) {
				console.log(chalk`{red.bold ${html.message}}`);
			}
		} else {
			data = {
				...innings1(html),
				...innings2(html),
			};
			console.log(data);
		}
	});

program
	.command('live')
	.alias('l')
	.description(`Live updates on today's match`)
	.action(async () => {
		const fetchData = async () => {
			let data;
			try {
				data = await shortInfo();
			} catch (err) {
				console.log(err);
			}
			if (data.noIPL) {
				console.log(chalk`{red.bold ${data.message}}`);
			} else {
				console.clear();
				printShortInfo(data);
			}
			setTimeout(fetchData, 20000);
		};
		setTimeout(fetchData, 1000);
	});
program.parse(process.argv);
