var width = 800;
var kitakyusyu_shi_map_size = {width:800,height:800};
var northern = 34.000632;
var southern = 33.713565;
var eastern = 131.013168;
var western = 130.643813;
var dstlng = eastern - western;
var dstltt = northern - southern;

//memo:MouseEventではsrcElementは古いので使わない 代わりにtarget

//開発モードの場合にログ出力するためのオブジェクト
var slf = {
	devmode:false,
	inv:function(callback) {
		if(this.devmode) callback();
	}
};
//localhostにアクセスしている場合は開発モードにする
if(location.origin.includes("localhost")) {
	slf.devmode=true;
}
slf.inv(function() {
	var s = northern - southern;
	//console.assert(44 === calcX(34));
});

var app;

window.addEventListener("load",function(event) {
	console.log(event);
	var kitakyusyu_shi_map = $('#kitakyusyu-shi-map');
	kitakyusyu_shi_map_size.width = kitakyusyu_shi_map.width();
	kitakyusyu_shi_map_size.height = kitakyusyu_shi_map.height();
	d3.csv("api/entries.csv",function(error, entries) {
		if(error) console.warn(error);
		_.map(entries, function(d,i) {
			if(!d.icon) d.icon = "point.svg";
			return d;
		});
		jQuery.ajax({
			type:"GET",
			url:"api/themes.json",
			dataType:"json",
			success: function(themes) {
				app = vueApp(entries,themes);
			},
			error: function(e) {
				console.warn(e);
			}
		});
	});
	$( '#fontsize' ).accessible_fontsize();
	$( '#inverse-btn' ).accessible_inverse();
});

function vueApp(entries,themes) {
	slf.inv(function() {
		console.log(entries);
		console.log(themes);
	});
	var kitakyusyu_shi_map = $('#kitakyusyu-shi-map');
	app = new Vue({
		el:"#app",
		data: {
			width:width,
			height:width,
			entries: entries,
			themes: themes,
			selectedEntry: null,
			targetTheme: null,
			targetArea: "",
			themeTargets: [],
			targets: [],
			keyword: null,
			iconSize : 100
		},
		computed: {

		},
		watch:{
			
		},
		methods:{
			getEntriesOfTheme: function(e) {
				var theme = _.find(this.themes.lists, function(v) {
					return v.id == Number(e);
				});
				return _.filter(this.entries, function(d,i) {
					return _.contains(theme.entries, Number(d.id));
				});
			},
			getTheme: function(e) {
				return _.find(this.themes.lists, function(d) {
					return d.id === e;
				})
			},
			//
			selectEntry: function(e) {
				jQuery('#select-pane .article').empty();
				this.selectedEntry = _.find(this.entries,function(i){return e.id === i.id});
				this.targets = [this.selectedEntry];
				this.targetTheme = null;
				this.selectedEntry = e;
			},
			selectArea: function(event) {
				this.targetArea = event.target.value;
				this.repaint();
			},
			selectTheme: function(e) {
				this.targetTheme = e;
				var themeTargets = this.entries;
				//
				if(this.targetTheme) {
					var targetTheme = this.targetTheme;
					themeTargets = _.filter(themeTargets,function(d,i) {
						return _.contains(targetTheme.entries, Number(d.id));
					});
				}
				this.themeTargets = themeTargets;
				slf.inv(function() {
					console.log(themeTargets);
				})
				this.repaint();
			},
			removeTheme: function() {
				this.targetTheme = null
				this.targets = [];
				this.repaint();
			},
			removeArea: function() {
				this.targetArea = "";
				this.repaint();
			},
			selectAll: function() {
				this.targetTheme = {name:"全て"};
				this.themeTargets = this.entries;
				this.repaint();
			},
			search: function() {
				jQuery('#select-pane .article').empty();
				//for inの中ではthisが別になるので詰め替えし
				var k = this.keyword;
				var filtered = _.filter(this.entries, function(data) {
					for(v in data) {
						if(data[v].includes(k)) return true;
					}
					return false;
				});
				this.targetTheme = {name:"キーワード："+k};
				this.themeTargets = filtered;
				this.repaint();
			},
			repaint: function() {
				jQuery('#select-pane .article').empty();
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
			styles: function(e) {
				if(!e.longitude || !e.latitude) {
					return "";
				}
				return "top:" + calcY(e.longitude) + "px;left:" + calcX(e.latitude) + "px";
				//'"top: ' + (i * 15) + 'px; left: ' + (i * 15) + 'px"
			},
			hover: function(t, me) {
				var li = jQuery(me.target).parent();
				var id = li.attr('id').substring(1);
				var entry = _.find(this.entries, function(d) {
					return d.id === id;
				});
				var val = '';
				if(t === 1) {
					val = '';
				} if(t === 2) {
					val = 'none';
				}
				slf.inv(function() {
					console.log(li);
					console.log(li.offset());
				})
				jQuery("#entryname")
				//offset()よりcss()を先に呼び出さないとoffsetの値が正常ではない
				.css('display',val)
				.offset({top:li.offset().top + 10,left:li.offset().left + 20})
				.text(entry.name);
			},
			pushCurrentPosition: function(e) {
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(function(p) {
						
					});
				} else {
				}
			},
			tab: function(e) {
				console.log(e);
			},
			loadContents: function(e, me) {
				var ep = jQuery(me.target).parent();
				jQuery.ajax({
					dataType:"html",
					url:e.article,
					success: function(data) {
						var d = jQuery(data).filter('article');
						var a = d.find('img').wrap(function() {
							return '<a rel="lightbox" href="' + this.getAttribute('src') + '"></a>';
						}).end();
						
						slf.inv(function() {
							console.log(d);
							console.log(a);
						});
						ep.empty().append(d);
					},
					error: function(XMLHttpRequest, textStatus, errorThrown) {
						console.log(textStatus);
					}
				});
			}
		}
	});
}
function calcX(longitude) {
    return ((longitude - western) / dstlng) * kitakyusyu_shi_map_size.width - (100 / 2);
}
function calcY(latitude) {
    return ((northern-latitude) / dstltt) * kitakyusyu_shi_map_size.height - (100 / 2);
}
