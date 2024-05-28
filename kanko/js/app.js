var slf = {
	devmode:false,
	inv:function(callback) {
		if(this.devmode) callback();
	}
};
slf.devmode = true;
slf.inv(function() {
	//console.assert(44 === calcX(34));
});

let app;

window.addEventListener("load",(event) => {
	console.log(event);
	d3.csv("../api/entries.csv",function(error, entries) {
		if(error) console.warn(error);
		_.map(entries, function(d,i) {
			if(!d.icon) d.icon = "point.svg";
			return d;
		});
		jQuery.ajax({
			type:"GET",
			url:"../api/themes.json",
			dataType:"json",
			success: function(themes) {
				app = vueApp(entries,themes);
			},
			error: function(e) {
				console.warn(e);
			}
		});
	});
});

function vueApp(entries,themes) {

	_.map(entries,function(d,i) {
		if(!d.icon) d.icon = "point.svg";
		return d;
	});
	console.log(entries);
	console.log(themes);
	var kitakyusyu_shi_map = $('#kitakyusyu-shi-map');
	console.log(kitakyusyu_shi_map.width());
	app = new Vue({
		el:"#app",
		data: {
			ksms:{width:kitakyusyu_shi_map.width(),height:kitakyusyu_shi_map.height()},
			entries: entries,
			themes: themes,
			targets: [],
			themeTargets:[],
			northern : 34.000632,
			southern : 33.693565,
			eastern : 131.013168,
			western : 130.643813,
			iconSize : 100,
			fs:[]
		},
		computed: {
			ew: function() {
				return this.eastern - this.western;
			},
			ns: function() {
				return this.northern - this.southern;
			}
		},
		methods:{
			getfs: function() {
				fs.readdir('.', (err, files)=>{
					console.log(files)
					this.fs = files;
				});
			},
			tab: function(e) {
				console.log(e);
				
			},
			styles: function(e) {
				if(!e.longitude || !e.latitude) {
					return "";
				}
				return "top:" + this.calcY(e.longitude) + "px;left:" + this.calcX(e.latitude) + "px";
				//'"top: ' + (i * 15) + 'px; left: ' + (i * 15) + 'px"
			},
			select_tab: function(e) {
				console.log(e);
			},
			select_item: function(id,e) {
				e.srcElement;
				console.log(e);
				$('.tab-content').css({display:"none"});
				$('#' + id).toggle();
				$('.nav-group-item').removeClass('active');
				$(e.srcElement).addClass('active');
			},
			mapping: function() {
				this.targetTheme = {name:"全て"};
				this.themeTargets = this.entries;
				this.repaint();
			},
			repaint: function() {
				$('#select-pane .article').empty();
				var themeTargets = this.themeTargets;
				var targets = themeTargets;
				if(this.targetArea) {
					//thisが変わるので値の詰め替え
					var targetArea = this.targetArea;
					targets = _.filter(themeTargets, function(d) {
						return d.area === targetArea;
					});
				}
				this.targets = targets;

				slf.inv(function() {
					console.log(themeTargets);
					console.log(targets);
				});
			},
			calcX: function(longitude) {
				return ((longitude - this.western) / this.ew) * this.ksms.width - (this.iconSize / 2);
			},
			calcY: function(latitude) {
				return ((this.northern - latitude) / this.ns) * this.ksms.height - (this.iconSize / 2);
			}
		}
	});
}
