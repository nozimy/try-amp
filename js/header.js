// Script to open and close sidebar

document.addEventListener("DOMContentLoaded", ready);

function ready(){
    brandName();
    var pageHeader_Center = document.getElementById("pageHeader_Center");
    var userControl = document.getElementById("user-controls");
    var headerSearch = document.getElementById("header_search_wrap");
    var pageHeader_Center_offset = pageHeader_Center.offsetTop;
    var userControl_offset = userControl.offsetTop;
    var headerSearch_offset = headerSearch.offsetTop;
    
    // When the user scrolls the page, execute myFunction 
    window.onscroll = function() {onScrollFunc()};
    // Get the navbar
    var navbar = document.getElementById("sticky-navbar");
    var stickyHeader = document.getElementById("sticky-header");
    
    // Get the offset position of the navbar
    var sticky = navbar.offsetTop;
    var stickyHeaderOffset = stickyHeader.offsetTop;
    
    var wWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    function onScrollFunc(){
        if (wWidth > 768 && window.pageYOffset && window.pageYOffset >= sticky) {
            navbar.classList.add("sticky")
        } else {
            navbar.classList.remove("sticky");
        }
        
        if (wWidth <= 768 && window.pageYOffset >= stickyHeaderOffset+20) {
            stickyHeader.classList.add("sticky")
        } else {
            stickyHeader.classList.remove("sticky");
        }
    }
    
    geoLocation();
}
function w3_open() {
    document.getElementById("mySidebar").style.display = "block";
    document.getElementById("myOverlay").style.display = "block";
}
function w3_close() {
    document.getElementById("mySidebar").style.display = "none";
    document.getElementById("myOverlay").style.display = "none";
}
function brandName(){
    var brand_name = document.getElementById("brand_name");
    brand_name.addEventListener("mouseover", function(e) {
      e.preventDefault;
      
      brand_name.classList.remove("text-color-animate-warm");
      
      // -> triggering reflow /* The actual magic */
      // without this it wouldn't work. Try uncommenting the line and the transition won't be retriggered.
      // Oops! This won't work in strict mode. Thanks Felis Phasma!
      // element.offsetWidth = element.offsetWidth;
      // Do this instead:
      void brand_name.offsetWidth;
      
      // -> and re-adding the class
      brand_name.classList.add("text-color-animate-warm");
    }, false);
}

function geoLocation(){
    /** Choose city in header*/
    var geocity = document.getElementById("geocity");
    var header_user_location_form = document.getElementById("header_user_location_form");
    var cross_btn_location_form = document.getElementById("cross_btn_location_form");
    
    geocity.addEventListener("click", function(e) {
      e.preventDefault;
      header_user_location_form.style.display = 'block';
    });
    
    cross_btn_location_form.addEventListener("click", function(e){
        header_user_location_form.style.display = 'none';
    });
    
    //     if(navigator.geolocation) {
    // 		console.log("Geolocation API поддерживается");
    // 		navigator.geolocation.getCurrentPosition(function(position) {
    // 				var latitude = position.coords.latitude;
    // 				var longitude = position.coords.longitude;
    // 				console.log(latitude, longitude)
    // 		})
    // 	} else {
    // 		console.log("Geolocation API не поддерживается в вашем браузере");
    // 	}
    
    $("#header_user_location_input").suggestions({
			serviceUrl: "https://suggestions.dadata.ru/suggestions/api/4_1/rs",
			token: "ad16e06b81f93cc8f14b14c3dfcaec7ac45efbda",
			type: "ADDRESS",
			bounds: "city",
			count: 5,
					/* Вызывается, когда пользователь выбирает одну из подсказок */
			onSelect: function (suggestion) {
				//console.log(suggestion);
				$.ajax({
					type: 'POST',
					url: "/personal",
					data: {action: 'city_set', city: suggestion.data.city},
					success: function (data) {
						console.log(data);
						$('.location-text').text(suggestion.data.city);
				        header_user_location_form.style.display = 'none';
					}
				});
			}
		});
}
