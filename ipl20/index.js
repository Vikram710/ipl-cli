const cheerio = require('cheerio');
const axios = require('axios');
const chalk = require('chalk');

const mainUrl = 'https://www.cricbuzz.com';

exports.innings1 = (html) => {
	const $ = cheerio.load(html);
	let data = {};

	data.innings1Batting = [];
	data.innings1Bowling = [];

	let battingFields = ['Batsman', 'Status', 'R', 'B', '4s', '6s', 'SR'];
	let bowlingFields = ['bowler', 'O', 'M', 'R', 'W', 'NB', 'WD', 'ECO'];

	data.innings1Team = $('div#innings_1 div.cb-scrd-hdr-rw')
		.text()
		.replace($('div#innings_1 div.cb-scrd-hdr-rw span.pull-right').text(), '')
		.trim();

	let count_bat = 0;
	let temp_bat = {};
	let count_bwl = 0;
	let temp_bwl = {};
	let bowling = false;
	let bowlingStart = 0;
	if (!$('div#innings_1 div.cb-ltst-wgt-hdr div.cb-col div.cb-col').text()) return {};
	$('div#innings_1 div.cb-ltst-wgt-hdr div.cb-col div.cb-col').each((i, ele) => {
		if (bowling) {
			if (i - bowlingStart > 7) {
				if (count_bwl % 8 == 0 && Object.keys(temp_bwl).length > 0) {
					data.innings1Bowling.push(temp_bwl);
					temp_bwl = {};
					count_bwl = 0;
				}
				temp_bwl[bowlingFields[count_bwl]] = $(ele).text().trim();
				count_bwl += 1;
			}
		} else {
			if ($(ele).text().trim() == 'Bowler') {
				bowling = true;
				bowlingStart = i;
			}
			if (i > 6) {
				if (count_bat % 7 == 0 && Object.keys(temp_bat).length > 0) {
					data.innings1Batting.push(temp_bat);
					temp_bat = {};
					count_bat = 0;
				}
				temp_bat[battingFields[count_bat]] = $(ele).text().trim();
				count_bat += 1;
			}
		}
	});

	if (Object.keys(temp_bat).length > 0) {
		data.innings1Batting.push(temp_bat);
		temp_bat = {};
	}

	let key = data.innings1Batting.length - 2;
	if (data.innings1Batting[key]['Batsman'] != 'Extras') {
		key = data.innings1Batting.length - 1;
	} else data.innings1NoBat = data.innings1Batting[data.innings1Batting.length - 1]['Batsman'];
	data.innings1Extras = data.innings1Batting[key]['Status'] + ' ' + data.innings1Batting[key]['R'];
	data.innings1Total = data.innings1Batting[key]['4s'] + ' ' + data.innings1Batting[key]['6s'];
	key = data.innings1Batting.length - key;
	Array.from(Array(key).keys()).forEach((ele) => data.innings1Batting.pop());

	data.innings1Fall = $('div#innings_1 div.cb-col-rt span').text();

	return data;
};

exports.innings2 = (html) => {
	const $ = cheerio.load(html);
	let data = {};

	data.innings2Batting = [];
	data.innings2Bowling = [];

	let battingFields = ['Batsman', 'Status', 'R', 'B', '4s', '6s', 'SR'];
	let bowlingFields = ['bowler', 'O', 'M', 'R', 'W', 'NB', 'WD', 'ECO'];

	data.innings2Team = $('div#innings_2 div.cb-scrd-hdr-rw')
		.text()
		.replace($('div#innings_2 div.cb-scrd-hdr-rw span.pull-right').text(), '')
		.trim();

	let count_bat = 0;
	let temp_bat = {};
	let count_bwl = 0;
	let temp_bwl = {};
	let bowling = false;
	let bowlingStart = 0;
	if (!$('div#innings_2 div.cb-ltst-wgt-hdr div.cb-col div.cb-col').text()) return {};
	$('div#innings_2 div.cb-ltst-wgt-hdr div.cb-col div.cb-col').each((i, ele) => {
		if (bowling) {
			if (i - bowlingStart > 7) {
				if (count_bwl % 8 == 0 && Object.keys(temp_bwl).length > 0) {
					data.innings2Bowling.push(temp_bwl);
					temp_bwl = {};
					count_bwl = 0;
				}
				temp_bwl[bowlingFields[count_bwl]] = $(ele).text().trim();
				count_bwl += 1;
			}
		} else {
			if ($(ele).text().trim() == 'Bowler') {
				bowling = true;
				bowlingStart = i;
			}
			if (i > 6) {
				if (count_bat % 7 == 0 && Object.keys(temp_bat).length > 0) {
					data.innings2Batting.push(temp_bat);
					temp_bat = {};
					count_bat = 0;
				}
				temp_bat[battingFields[count_bat]] = $(ele).text().trim();
				count_bat += 1;
			}
		}
	});

	if (Object.keys(temp_bat).length > 0) {
		data.innings2Batting.push(temp_bat);
		temp_bat = {};
	}

	let key = data.innings2Batting.length - 2;
	if (data.innings2Batting[key]['batsman'] != 'Extras') {
		key = data.innings2Batting.length - 1;
	} else data.innings2NoBat = data.innings2Batting[data.innings2Batting.length - 1]['Batsman'];
	data.innings2Extras = data.innings2Batting[key]['Status'] + ' ' + data.innings2Batting[key]['R'];
	data.innings2Total = data.innings2Batting[key]['4s'] + ' ' + data.innings2Batting[key]['6s'];
	key = data.innings2Batting.length - key;
	Array.from(Array(key).keys()).forEach((ele) => data.innings2Batting.pop());
	data.innings2Fall = $('div#innings_2 div.cb-col-rt span').text();

	return data;
};

exports.matchInfo = async () => {
	let response, html;
	try {
		response = await axios.get(mainUrl + '/live-cricket-scores/');
		html = response.data;
		let $ = cheerio.load(html);
		let liveUrl = mainUrl;
		$('a.cb-mtch-lnks').each((i, ele) => {
			if (i == 1) liveUrl += $(ele).attr('href');
		});
		if (!liveUrl.includes('live-cricket-scorecard'))
			liveUrl = liveUrl.replace('cricket-match-news', 'live-cricket-scorecard');
		if (!liveUrl.includes('indian-premier-league'))
			return {
				noIPL: true,
				message: 'There are no matches at the moment. Please check back later.',
			};
		response = await axios.get(liveUrl);
		html = response.data;
	} catch (err) {
		console.log(err);
	}

	const $ = cheerio.load(html);
	let data = {};
	let fields = ['Match', 'Date', 'Toss', 'Time', 'Venue', 'Umpires', 'Third Umpires', 'Match Refree'];
	$('div.cb-mtch-info-itm div.cb-col-73').each((i, ele) => {
		data[fields[i]] = $(ele).text().trim();
	});
	delete data['Date'];
	delete data['Time'];
	delete data['Umpires'];
	delete data['Third Umpires'];
	delete data['Match Refree'];

	$('div.cb-minfo-tm-nm').each((i, ele) => {
		if (i == 0) data.team1 = $(ele).text().replace('Squad', '').trim();
		if (i == 3) data.team2 = $(ele).text().replace('Squad', '').trim();
	});
	$('div.cb-minfo-tm-nm div.cb-col-73').each((i, ele) => {
		if (i == 0) data.team1Squad = $(ele).text().trim();
		if (i == 2) data.team2Squad = $(ele).text().trim();
	});

	return data;
};

exports.shortInfo = async () => {
	let response, html;
	try {
		response = await axios.get(mainUrl + '/live-cricket-scores/');
		html = response.data;
	} catch (err) {
		console.log(err);
	}

	const $ = cheerio.load(html);
	if (!$('h2.cb-lv-scr-mtch-hdr').text().includes('INDIAN PREMIER LEAGUE'))
		return {
			noIPL: true,
			message: 'There are no matches at the moment. Please check back later.',
		};
	let data = {};
	data.match = $('h3.cb-lv-scr-mtch-hdr a').first().text();
	$('div.cb-schdl span').each((i, ele) => {
		if (i === 0) {
			data.matchNo = $(ele).text().trim();
		} else if (i == 4) {
			data.stadium = $(ele).text().trim();
		}
	});

	data.battingTeam = {};
	data.battingTeam.name = $('a div.cb-hmscg-bat-txt div.cb-hmscg-tm-nm').first().text();
	data.battingTeam.score = $('a div.cb-hmscg-bat-txt').first().text().replace(data.battingTeam.name, '');
	data.bowlingTeam = {};
	data.bowlingTeam.name = $('a div.cb-hmscg-bwl-txt div.cb-hmscg-tm-nm').first().text();
	data.bowlingTeam.score = $('a div.cb-hmscg-bwl-txt').first().text().replace(data.bowlingTeam.name, '');
	data.info = $('a [class*="cb-text"]:nth-child(3)').first().text();
	if (
		!data.bowlingTeam.score
			.replace(/(^.*\(|\).*$)/g, '')
			.replace('Ovs', '')
			.trim() ||
		parseInt(
			data.battingTeam.score
				.replace(/(^.*\(|\).*$)/g, '')
				.replace('Ovs', '')
				.trim()
		) >
			parseInt(
				data.bowlingTeam.score
					.replace(/(^.*\(|\).*$)/g, '')
					.replace('Ovs', '')
					.trim()
			)
	) {
		data.batFirst = data.battingTeam.name;
	} else if (
		parseInt(
			data.battingTeam.score
				.replace(/(^.*\(|\).*$)/g, '')
				.replace('Ovs', '')
				.trim()
		) ===
		parseInt(
			data.bowlingTeam.score
				.replace(/(^.*\(|\).*$)/g, '')
				.replace('Ovs', '')
				.trim()
		)
	) {
		data.batFirst = data.info.includes('runs') ? data.battingTeam.name : data.bowlingTeam.name;
	} else {
		data.batFirst = data.bowlingTeam.name;
	}

	data.innings2 = data.bowlingTeam.score
		.replace(/(^.*\(|\).*$)/g, '')
		.replace('Ovs', '')
		.trim()
		? true
		: false;

	return data;
};

exports.pointsTable = async (width) => {
	let response, html;
	let pointsTableUrl = 'https://www.cricbuzz.com/cricket-series/3130/indian-premier-league-2020/points-table';
	try {
		response = await axios.get(pointsTableUrl);
		html = response.data;
	} catch (err) {
		console.log(err);
	}
	const $ = cheerio.load(html);
	let data = {};
	let count = 0;
	let temp = {Team: ''};
	data.table = [];
	let fields = ['Mat', 'Won', 'Lost', 'Tied', 'NR', 'Pts', 'NRR'];
	$('table.cb-srs-pnts tbody tr:nth-child(odd) td.cb-srs-pnts-td').each((i, ele) => {
		if (Object.keys(temp).length > 1 && count % 7 === 0) {
			data.table.push(temp);
			temp = {Team: ''};
			count = 0;
		}
		if (count == 6) {
			temp[fields[count]] = parseFloat($(ele).text().trim());
		} else {
			temp[fields[count]] = parseInt($(ele).text().trim());
		}
		count += 1;
	});
	if (Object.keys(temp).length > 1) {
		data.table.push(temp);
	}
	$('table.cb-srs-pnts tbody tr:nth-child(odd) td.cb-srs-pnts-name').each((i, ele) => {
		data.table[i]['Team'] = $(ele).text().trim();
	});
	data.table.forEach((ele, i) => {
		ele['Rank'] = i + 1;
		if (width < 90) {
			delete ele['NR'];
			delete ele['Tied'];
		}
	});
	return data;
};

exports.getScorecard = async () => {
	try {
		response = await axios.get(mainUrl + '/live-cricket-scores/');
		html = response.data;
		let $ = cheerio.load(html);
		let liveUrl = mainUrl;
		$('a.cb-mtch-lnks').each((i, ele) => {
			if (i == 1) liveUrl += $(ele).attr('href');
		});
		console.log(liveUrl);
		if (!liveUrl.includes('indian-premier-league'))
			return {
				noIPL: true,
				message: 'There are no matches at the moment. Please check back later.',
			};
		response = await axios.get(liveUrl);
		html = response.data;
	} catch (err) {
		console.log(err);
	}
	return html;
};

exports.printTable = (table) => {
	const transformedTable = table.reduce((acc, {Rank, ...x}) => {
		acc[Rank] = x;
		return acc;
	}, {});
	console.table(transformedTable);
};

exports.printShortInfo = (data) => {
	console.log(chalk.cyan(data.match) + ' ' + data.matchNo + ' ' + data.stadium);
	let color1 = 'white';
	let color2 = 'white';
	if (data.innings2) color2 = 'green';
	else color1 = 'green';
	if (data.batFirst == data.battingTeam.name) {
		console.log(chalk[color1](data.battingTeam.name) + '\t' + data.battingTeam.score);
		console.log(chalk[color2](data.bowlingTeam.name) + '\t' + data.bowlingTeam.score);
	} else {
		console.log(chalk[color1](data.bowlingTeam.name) + '\t' + data.bowlingTeam.score);
		console.log(chalk[color2](data.battingTeam.name) + '\t' + data.battingTeam.score);
	}
	console.log(chalk`{yellow ${data.info}}`);
};

const stringDivider = (str, width, spaceReplacer = '\n') => {
	if (str.length > width) {
		var p = width;
		for (; p > 0 && str[p] != ' '; p--) {}
		if (p > 0) {
			var left = str.substring(0, p);
			var right = str.substring(p + 1);
			return left + spaceReplacer + stringDivider(right, width, spaceReplacer);
		}
	}
	return str;
};

exports.printDetailedInfo = (data) => {
	console.log(chalk`{bold.magentaBright ${data.Match.replace('Indian Premier League 2020', data.Venue)}}`);
	console.log(data.Toss);
	console.log('');
	console.log(chalk`{bold.green ${data.team1}}`);
	console.log(stringDivider(data.team1Squad, 60) + '\n');
	console.log(chalk`{bold.cyan ${data.team2}}`);
	console.log(stringDivider(data.team2Squad, 60));
};
