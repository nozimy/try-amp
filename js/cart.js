(function(){
    main();
})();

function main(){ $(document).ready(function() {
    var ReduxThunk = window.ReduxThunk.default;
    var createStore = Redux.createStore;
    
    var store = createStore(
        reducer,
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
        Redux.applyMiddleware(
            ReduxThunk
        )
    );
    
    const cart = new Cart({
        el: $('#lvk-cart-app'),
        toCartButton: $('.btn-tocart'),
        toCartPlusOne: $('.btn-tocart--plusOne'),
        cart_count_badge: $("a[href='/cart']").find('.badger'),
        clear_cart_btn: $('.btn-clear-cart'),
        store: store
    });
    cart.store.dispatch(ac_fetchCart());
    
    //cart.render();
});}

/** ================================================================================================================================== */
/** Reducer */
function reducer(state, action){
    var ac = ac_names;
    if (!state) state = {};
    switch(action.type){
        // case 'GET_CART':
        //     return getCart(state);
        // case 'ADD_TO_CART':
        //     return addToCart(state, action.product_id);
        
        case ac.REQUEST_CART:
            return $.extend({}, state, {
                isFetching: true
            });
        case ac.RECEIVE_CART:
            return $.extend({}, state, {
               isFetching: false
            }, action.cartState);
        case ac.CLEAR_CART:
            return $.extend({}, action.cartState, {
               isFetching: false
            });
        case ac.TOGGLE_REMOVE_ITEM:
            return $.extend({}, state, {
                subOrders: state.subOrders.map(function(sub){
                    sub.items = sub.items.map(function(item, index){
                        if(item.id == action.id){
                            return $.extend({}, item, {
                                removed: !item.removed
                            })
                        }
                        return item;
                    });
                    return sub;
                })
            });
        case ac.FINAL_REMOVE_ITEM:
            return $.extend({}, state, {
                subOrders: state.subOrders.map(function(sub){
                    sub.items = sub.items.filter(function(item){
                        return item.id !== action.id;
                    });
                    return sub;
                })
            });
        case ac.SET_DELIVERY_ADDRESS:
            return $.extend({}, state, {
                subOrders: state.subOrders.map(function(sub){
                    if (sub.shopID == action.shopID){
                        
                        sub.deliveryParams = {
                            address: _.pick(action.suggestion.data, ['value','postal_code','country','region','city','street','house','block','flat','metro','geo_lat','geo_lon']),
                        }
                        sub.deliveryParams.address.unrestricted_value = action.suggestion.unrestricted_value;
                        return sub;
                    }
                    return sub;
                })
            });
        // case 'TEST':
        //     return test(state, action.text);
    }
    return state;
}

/** ================================================================================================================================== */
/** Actions Creators*/

function ac_getCart(){
    return {
        type: 'GET_CART'
    }
}
function ac_addToCart(product_id){
    return {
        type: 'ADD_TO_CART',
        product_id: product_id
    }
}

function ac_requestCart(){
    return {
        type: ac_names.REQUEST_CART    
    }
}
function ac_receiveCart(cartState){
    return {
        type: ac_names.RECEIVE_CART,
        cartState: cartState
    }   
}

function ac_fetchCart(){
    return dispatch => {
        dispatch(ac_requestCart());
        $.ajax({
          type: 'GET',
          xhrFields: {
            withCredentials: true
          },
          url: 'https://lvk130-nozimy.c9users.io:8081/api/cart/',
          success: function(resp) {
            dispatch(ac_receiveCart(resp));
          },
          error: function() {
            
          }
        })    
    }
}
function ac_postItemToCart(product){
    return dispatch => {
        dispatch(ac_requestCart());
        $.ajax({
            type: 'POST',
            xhrFields: {
                withCredentials: true
            },
            url: "https://lvk130-nozimy.c9users.io:8081/api/cart/item",
            data: {product_id: product.id, qty: product.qty},
            success: function(resp) {
                //$('.alert-cart').show();
                // if (data.message != "Товар уже в вашей корзине") {
                // 	if ($("a[href='/cart']").find('.count').length < 1) {
                // 		$("a[href='/cart']").find('.badged').append('<span class="badger"><span class="count">0</span></span>');
                // 	}
                //     $("a[href='/cart']").find('.count').text(parseInt($("a[href='/cart']").find('.count').text())+1);
                // }
                // makeToast(data.message);
                dispatch(ac_receiveCart(resp));
            }
        });
    }
}
function ac_clearCart(cartState){
    return {
        type: ac_names.CLEAR_CART,
        cartState: cartState
    }
}
function ac_requestClearCart(){
    return dispatch => {
        dispatch(ac_requestCart());
        
        $.ajax({
            type: 'POST',
            xhrFields: {
                withCredentials: true
            },
            url: "https://lvk130-nozimy.c9users.io:8081/api/cart/clear",
            
            success: function(resp) {
                dispatch(ac_clearCart(resp));
            }, 
            error: function() {
                console.log('error ajax');
            }
        });    
    }
    
}
function ac_updateItemIncart(product) {
    return dispatch => {
        dispatch(ac_requestCart());
        $.ajax({
            type: 'POST',
            xhrFields: {
                withCredentials: true
            },
            url: "https://lvk130-nozimy.c9users.io:8081/api/cart/update",
            data: {
                product_id: product.id, qty: product.qty
            },
            success: function(resp) {
                dispatch(ac_receiveCart(resp));
            }
        });
    }
}
function ac_toggleRemoveItem(product){
    return dispatch => {
        // dispatch({
        //     type: ac_names.TOGGLE_REMOVE_ITEM,
        //     id: id
        // });
        dispatch(ac_requestCart());
        $.ajax({
            type: 'POST',
            xhrFields: {
                withCredentials: true
            },
            url: "https://lvk130-nozimy.c9users.io:8081/api/cart/update",
            data: {
                product_id: product.id, removed: product.removed
            },
            success: function(resp) {
                //dispatch(ac_receiveCart(resp));
                dispatch(ac_receiveCart(resp));
                //console.log(resp);
                //alert(JSON.stringify(resp));
            }
        });
    }
    
    // return {
    //     type: ac_names.TOGGLE_REMOVE_ITEM,
    //     id: id
    // }
}

function ac_finalRemoveItem(id){
    return dispatch => {
        //dispatch(ac_requestCart());
        
        $.ajax({
            type: 'POST',
            xhrFields: {
                withCredentials: true
            },
            url: "https://lvk130-nozimy.c9users.io:8081/api/cart/remove",
            data: {
                product_id: id
            },
            success: function(resp) {
                dispatch(ac_receiveCart(resp));
            }
        });
    }
    // return {
    //     type: ac_names.FINAL_REMOVE_ITEM,
    //     id: id
    // }
}
function ac_setDeliveryAddress(shopID, suggestion){
    return {
        type: ac_names.SET_DELIVERY_ADDRESS,
        shopID: shopID,
        suggestion: suggestion
        
    }
}
var ac_names = {
    REQUEST_CART: 'REQUEST_CART',
    RECEIVE_CART: 'RECEIVE_CART',
    POST_ITEM_TO_CART: 'POST_ITEM_TO_CART',
    CLEAR_CART: 'CLEAR_CART',
    TOGGLE_REMOVE_ITEM: 'TOGGLE_REMOVE_ITEM',
    FINAL_REMOVE_ITEM: 'FINAL_REMOVE_ITEM',
    SET_DELIVERY_ADDRESS: 'SET_DELIVERY_ADDRESS'
}

/** Actions */
// function test(state, text){
//     return {
//         text: text
//     }
// }
// function getCart(state){
//     $.ajax({
//       type: 'GET',
//       xhrFields: {
//         withCredentials: true
//       },
//       url: 'https://lvk130-nozimy.c9users.io:8081/cart/',
//       success: function(resp) {
//         state = resp;
//         console.log(resp);
//       },
//       error: function() {
        
//       }
//     })    
// }
// function addToCart(productID){
//     $.ajax({
//         type: 'POST',
//         url: "/cart/item",
//         data: {product: productID},
//         success: function(data) {
//     	    console.log(data);
//             //$('.alert-cart').show();
//             if (data.message != "Товар уже в вашей корзине") {
//             	if ($("a[href='/cart']").find('.count').length < 1) {
//             		$("a[href='/cart']").find('.badged').append('<span class="badger"><span class="count">0</span></span>');
//             	}
//                 $("a[href='/cart']").find('.count').text(parseInt($("a[href='/cart']").find('.count').text())+1);
//             }
//             // makeToast(data.message);
//         }
// });
// }
/** ================================================================================================================================== */
/** Cart class */
function Cart(options){
    this.$el = options.el;
    this.$toCartBtn = options.toCartButton;
    this.$clear_cart_btn = options.clear_cart_btn;
    this.$cart_count_badge = options.cart_count_badge;
    this.$toCartPlusOne = options.toCartPlusOne;
    
    this.store = options.store;
    this.store.subscribe(this.update.bind(this));
    
    this.$toCartBtn.on('click', this.addToCart.bind(this));
    this.$clear_cart_btn.on('click', this.clearCart.bind(this));
    this.$toCartPlusOne.on('click', this.updateItemIncart.bind(this));
    
}

Cart.prototype.update = function(){
    console.log(this.store.getState());

    this.renderBadger();
    this.renderCartItems();
    
    this.applyEventHandlers.bind(this)();
}
Cart.prototype.render = function(){
    this.update();
}
Cart.prototype.renderBadger = function(){
    if (this.store.getState().totalCount > 0){
        this.$cart_count_badge.css('display', 'block').find('.count').text(this.store.getState().totalCount);
    } else {
        this.$cart_count_badge.css('display', 'none')
    }
}
Cart.prototype.renderCartItems = function(){
    var items = this.$el.find('#cart-items');
    var state = this.store.getState();
    if(!items.length){
        this.$el.append('<div id="cart-items"></div>')
    }
    
    items.empty();
    if (state && state.subOrders && state.subOrders.length > 0){
        state.subOrders.forEach(function(sub){
            items.append(ShopComponent(sub));
            sub.items.forEach(function(item){
                items.append(ItemComponent(item));
            });
        });    
        items.append(CartTotalsComponent(state));
    }
    
}
// Cart.prototype.renderCartTotals = function(){
//     this.$el.append(CartTotalsComponent(this.store.getState()));
// }
Cart.prototype.addToCart = function(e){
    var id = e.target.dataset.product_id;
    
    this.store.dispatch(ac_postItemToCart({
        id: id,
        qty: 1
    }))
}

Cart.prototype.clearCart = function(){
    this.store.dispatch(ac_requestClearCart());
}
Cart.prototype.updateItemIncart = function(e){
    var id = e.target.dataset.product_id;
    var qty = 1;
    if (this.findItemById(id)){
        this.store.dispatch(ac_updateItemIncart({
            id: id,
            qty: (parseInt(this.findItemById(id).qty, 10) + qty)
        }));    
    }
}

function getConstants(){
    return {
        ITEM_IN_CART: "Товар уже в вашей корзине",
    };
}
Cart.prototype.findItemById = function(product_id){
    var store = this.store.getState();
    var foundItem = null;
    for(var i = 0; i < store.subOrders.length; i++){
        for(var j = 0; j < store.subOrders[i].items.length; j++){
            var item = store.subOrders[i].items[j]
            if(item.id == product_id) {
                foundItem = item;
                break;
            }     
        }
        if (foundItem) break;
    }
    return foundItem;
}

Cart.prototype.applyEventHandlers = function(){
    $('.dec-qty').click(this.decQty.bind(this));
    $('.inc-qty').click(this.incQty.bind(this));
    $('.toggle-remove-item-from-cart').click(this.toggleRemoveItem.bind(this));
    $('.final-remove-item-from-cart').click(this.finalRemoveItem.bind(this));
    
	$("#cart-delivery-input").suggestions({
		serviceUrl: "https://suggestions.dadata.ru/suggestions/api/4_1/rs",
		token: "ad16e06b81f93cc8f14b14c3dfcaec7ac45efbda",
		type: "ADDRESS",
		
		count: 5,
				/* Вызывается, когда пользователь выбирает одну из подсказок */
		onSelect: onSelect_sug.bind(this)
	});
}
function onSelect_sug(suggestion){
    console.log('suggestion', suggestion);
    console.log('suggestion.data', suggestion.data);
    var elem = $("#cart-delivery-input");
	//elem.val(suggestion.value);
	var shopID = elem.closest('.shop-container').data('shopid');
 	this.store.dispatch(ac_setDeliveryAddress(shopID, suggestion));
}
Cart.prototype.decQty = function(e){
    
    var btn = $(e.target);
    var id = btn.closest('.item-container').data('product_id');
    var item = this.findItemById(id);
    if (item){
        var qty = parseInt(item.qty);
        if (qty > 1) {
            --qty;
            this.store.dispatch(ac_updateItemIncart({
                id: id,
                qty: qty
            }));
        }
    }
}


Cart.prototype.incQty = function(e){
    var btn = $(e.target);
    var id = btn.closest('.item-container').data('product_id');
    var item = this.findItemById(id);
    if (item){
        var qty = parseInt(item.qty);
        ++qty;
        this.store.dispatch(ac_updateItemIncart({
            id: id,
            qty: qty
        }));
    }
}

Cart.prototype.toggleRemoveItem = function(e){
    var btn = $(e.target);
    var id = btn.closest('.item-container').data('product_id');
    var item = this.findItemById(id);
    if (item){
        this.store.dispatch(ac_toggleRemoveItem({
            id: id,
            removed: !item.removed
        }));
    }
}
Cart.prototype.finalRemoveItem = function(e){
    var btn = $(e.target);
    var id = btn.closest('.item-container').data('product_id');
    var item = this.findItemById(id);
    if (item){
        this.store.dispatch(ac_finalRemoveItem(id));
    }
    
}
/** ================================================================================================================================== */

function ItemComponent(props){
    if(!props) props = {
        id: 'Не задано',
        name: 'Не задано',
        price: 0,
        discount: 0,
        qty: 0,
        removed: false
    }
    props = {
        id: props.id || 'Не задано',
        name: props.name || 'Не задано',
        price: props.price || 0,
        discount: props.discount || 0,
        qty: props.qty || 0,
        removed: props.removed || false
    }
    
    var html = `<div class="item-container" data-product_id="`+ props.id + `">
                    <div class="item">
                        <br>
                        <img src="https://lavka.club/uploads/avatars/58bac411ba6f4743d2c20595/40/y7HVN9f8lANsFC83.jpg" alt="product name">
                        <span> ` + props.name + `</span>
                        <span>` + props.price + ` руб.</span>
                        скидка <span>` + props.discount + `%</span>
                        ` + (props.removed ? 'товар удален из корзины' : '' ) + `
                        <i class="toggle-remove-item-from-cart" style="cursor:pointer;">` + (props.removed ? 'отменить' : 'удалить' )  + `</i>
                        ` + (props.removed ? '<i class="final-remove-item-from-cart" style="cursor:pointer;">x</i>' : '' ) + `
                    </div>
                    `+ (props.removed ? '' : `
                    <div>
                        <button class="dec-qty">-</button><input type="number" name="qty" min="1" value="` + props.qty + `"><button class="inc-qty">+</button>
                    </div>
                    
                    <span>`+ props.qty*props.price+ `</span> руб
                    ` ) + `
                    <hr>
                </div>`;
                
                // <div>
                //  <input type="text" name="deliveryParams" value="deliveryParams">
                //  <br>
                //  <input type="text" name="paymentParams" value="paymentParams">
                //  </div>
    return html;
}

function ShopComponent(props){
    if (!props) props = {
        shopID: 0,
        name: 'Не задано',
        img: 'https://lavka.club/uploads/avatars/58bac411ba6f4743d2c20595/40/y7HVN9f8lANsFC83.jpg',
        deliveryParams: {}
    }
    props = {
        shopID: props.shopID,
        name: props.name || 'Не задано',
        img: props.img || 'https://lavka.club/uploads/avatars/58bac411ba6f4743d2c20595/40/y7HVN9f8lANsFC83.jpg',
        deliveryParams: props.deliveryParams || {}
    }
    var html = `<div class="shop-container" data-shopid="` + props.shopID + `">
        <span>` + props.shopID + `</span>
        <span>` + props.name + `</span>
        <img src="` + props.img + `" alt="shop name">
        <hr>
        <div style="border: 1px solid; padding: 10px;">
            Куда доставить: <input id="cart-delivery-input" value="`+ (props.deliveryParams.address ? props.deliveryParams.address.unrestricted_value : '')+ `"/>
            способ доставки: 
            <select name="select">
              <option value="value1" selected>Выберите</option>
              <option value="value2">Почтовая служба</option>
              <option value="value3">Экспресс доставка</option>
            </select>
            способ оплаты:
            <select class="paymethod" id="paymethod-415111" name="paymethod" style="width: 177px;" data-prevonline="a">
				<option value="" selected="">Выберите</option>
				<option value="a_5" >Перевод на банковскую карту</option>
			    <option value="a_6">Электронные платёжные системы</option>
			    <option value="a_7">Система денежных переводов</option>
			</select>
        </div>
    </div>`;
    return html;
}
function CartTotalsComponent(props){
    if (!props) props = {
        totalCount: 0,
        totalSum: 0
    }
    props = {
        totalCount:props.totalCount || 0,
        totalSum: props.totalSum || 0
    }
    var html = `<div>
        <hr>
        total count <span>` + props.totalCount + `</span>
        <br>
        total sum <span>` + props.totalSum + `</span>
    </div>`;
    return html;
}

		
// function action_creators(){
//     return {
//         getCart: function(){
//             return {
//                 type: 'GET_CART'
//             }
//         },
//         addToCart: function(product_id){
//             return {
//                 type: 'ADD_TO_CART',
//                 product_id: product_id
//             }
//         },
//         requestCart: function(){
//             return {
//                 type: this.names.REQUEST_CART    
//             }   
//         },
//         receiveCart: function(cartState){
//             return {
//                 type: this.names.RECEIVE_CART,
//                 cartState: cartState
//             }   
//         },
//         fetchCart: function(){
//             return function(dispatch){
//                 dispatch(this.requestCart());
//                 $.ajax({
//                   type: 'GET',
//                   xhrFields: {
//                     withCredentials: true
//                   },
//                   url: 'https://lvk130-nozimy.c9users.io:8081/cart/',
//                   success: function(resp) {
//                     dispatch(this.receiveCart(resp));
//                     //state = resp;
//                     console.log(resp);
//                   },
//                   error: function() {
                    
//                   }
//                 })    
//             }
//         }
//         ,names: {
//             REQUEST_CART: 'REQUEST_CART',
//             RECEIVE_CART: 'RECEIVE_CART',
//         }
//         // ,
//         // test: function(text){
//         //     return {
//         //         type: 'TEST',
//         //         text: text
//         //     }
//         // }
//     }
// }



