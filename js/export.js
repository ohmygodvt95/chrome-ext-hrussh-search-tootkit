$('#pagelet_rhc_footer').append("<hr><button class=\"hrussh-btn\">Export Data<span><span></button>");

$(window).scroll(function(event){
   $('.hrussh-btn span').text('(' + $('div._pac').length +')');
});

function datenum(v, date1904) {
	if(date1904) v+=1462;
	var epoch = Date.parse(v);
	return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

function sheet_from_array_of_arrays(data, opts) {
	var ws = {};
	var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
	for(var R = 0; R != data.length; ++R) {
		for(var C = 0; C != data[R].length; ++C) {
			if(range.s.r > R) range.s.r = R;
			if(range.s.c > C) range.s.c = C;
			if(range.e.r < R) range.e.r = R;
			if(range.e.c < C) range.e.c = C;
			var cell = {v: data[R][C] };
			if(cell.v == null) continue;
			var cell_ref = XLSX.utils.encode_cell({c:C,r:R});
			
			if(typeof cell.v === 'number') cell.t = 'n';
			else if(typeof cell.v === 'boolean') cell.t = 'b';
			else if(cell.v instanceof Date) {
				cell.t = 'n'; cell.z = XLSX.SSF._table[14];
				cell.v = datenum(cell.v);
			}
			else cell.t = 's';
			
			ws[cell_ref] = cell;
		}
	}
	if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
	return ws;
}

function Workbook() {
	if(!(this instanceof Workbook)) return new Workbook();
	this.SheetNames = [];
	this.Sheets = {};
}

function s2ab(s) {
	var buf = new ArrayBuffer(s.length);
	var view = new Uint8Array(buf);
	for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
	return buf;
}

$(document).on('click', '.hrussh-btn', function() {
	var BASE = 'https://www.facebook.com';
	var nameGroups = [];
	var linkGroups = [];
	var countMembers = [];

	$('a[data-testid$="EntGroup"]').each(function(index) {
		var name = $(this).text();
		var link = $(this).attr('href');
		if (name.length > 0) {
			nameGroups.push(name);
			linkGroups.push(BASE + link);
		}
	});

	$('div._pac').each(function(index) {
		var string = $(this).text().split(" ");
		countMembers.push(string[0]);
	});

	if(nameGroups.length > 0) {
		var ws_name = "FBGroups";
		var data = [];
		data.push(["ID", "NAME", "LINK", "MEMBERS"]);
		for(var i = 0; i < nameGroups.length; i++) {
			data.push([i + 1, nameGroups[i], linkGroups[i], countMembers[i]]);
		}
		var wopts = { bookType:'xlsx', bookSST:false, type:'binary' };
		var wb = new Workbook(), ws = sheet_from_array_of_arrays(data);
		wb.SheetNames.push(ws_name);
		wb.Sheets[ws_name] = ws;
 		var wbout = XLSX.write(wb, wopts);
		/* add worksheet to workbook */
		
		
		

		/* the saveAs call downloads a file on the local machine */
		var time = new Date().toLocaleTimeString();
		saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), time +"-data.xlsx");
	}
});