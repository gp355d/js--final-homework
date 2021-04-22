document.addEventListener('DOMContentLoaded', function() {
    const ele = document.querySelector('.recommendation-wall');
    ele.style.cursor = 'grab';
    let pos = { top: 0, left: 0, x: 0, y: 0 };
    const mouseDownHandler = function(e) {
        ele.style.cursor = 'grabbing';
        ele.style.userSelect = 'none';

        pos = {
            left: ele.scrollLeft,
            top: ele.scrollTop,
            // Get the current mouse position
            x: e.clientX,
            y: e.clientY,
        };

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    };
    const mouseMoveHandler = function(e) {
        // How far the mouse has been moved
        const dx = e.clientX - pos.x;
        const dy = e.clientY - pos.y;

        // Scroll the element
        ele.scrollTop = pos.top - dy;
        ele.scrollLeft = pos.left - dx;
    };
    const mouseUpHandler = function() {
        ele.style.cursor = 'grab';
        ele.style.removeProperty('user-select');

        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    };
    // Attach the handler
    ele.addEventListener('mousedown', mouseDownHandler);
});
// menu 切換
let menuOpenBtn = document.querySelector('.menuToggle');
let linkBtn = document.querySelectorAll('.topBar-menu a');
let menu = document.querySelector('.topBar-menu');
menuOpenBtn.addEventListener('click', menuToggle);

linkBtn.forEach((item) => {
    item.addEventListener('click', closeMenu);
})

function menuToggle() {
    if(menu.classList.contains('openMenu')) {
        menu.classList.remove('openMenu');
    }else {
        menu.classList.add('openMenu');
    }
}
function closeMenu() {
    menu.classList.remove('openMenu');
}
let productData = [];
let cartData = [];
let totalPrice=0;
const productList = document.querySelector('.productWrap');
const cartList = document.querySelector('.carts');
const total = document.querySelector('.total-price');
const buyBtn = document.querySelector('.productWrap');
const deleteBtn = document.querySelector('.discardAllBtn');
const form = document.querySelector('.orderInfo-form');
const selectOption = document.querySelector('.productSelect');
const alertMsg = document.querySelectorAll('.orderInfo-message');
// const forms = document.querySelectorAll('form');
// const formArray = Array.apply(null, forms);
// console.log(formArray);


function init(){
  showProductList();
  getCartList();
}
//顯示產品列表
function showProductList(){
  axios.get(`${url}/${api_path}/products`)
  .then(function(response){
    // console.log(response);
    productData = response.data.products;
    renderProductList(productData);
  })
}
//渲染產品列表
function renderProductList(data){
  let str = '';
  data.forEach(function(item){
    str+=
    `<li class="productCard">
      <h4 class="productType">${item.category}</h4>
      <img src="${item.images}" alt="">
      <a href="#" id="addCardBtn" data-id="${item.id}"class="js-addCart">加入購物車</a>
      <h3>${item.title}</h3>
      <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
      <p class="NTnowPrice">NT$${toThousands(item.price)}</p>
    </li>
    `
    productList.innerHTML = str;
  })
}
//渲染購物車列表
function renderCartList(cartData,totalPrice){
  let str = '';
  if(cartData.length == 0){
    str+=`<tr><td colspan="6"><p style="text-align: center">目前無選購商品</p></td></tr>`
  }
    cartData.forEach(function(item){
      console.log(cartData.length);
        str+=
        `<tr>
          <td>
            <div class="cardItem-title">
              <img src="${item.product.images}" alt="">
              <p>${item.product.title}</p>
            </div>
          </td>
          <td>NT$${toThousands(item.product.price)}</td>
          <td>
            <button class="numedit re">
              <span class="material-icons cartAmount-icon" data-num="${item.quantity - 1}" data-id="${item.id}">remove
              </span>
            </button>
            <span>${item.quantity}</span>
            <button class="numedit">
              <span class="material-icons cartAmount-icon" data-num="${item.quantity + 1}" data-id="${item.id}">add
              </span>
            </button>
          </td>
          <td>NT$${toThousands(item.quantity*item.product.price)}</td>
          <td class="discardBtn">
            <a href="#" class="material-icons delSingleBtn" data-id="${item.id}">
              clear
            </a>
          </td>
        </tr>
        `
    })
    cartList.innerHTML = str;
    total.textContent = toThousands(totalPrice);
}
function editCartNum(num, id) {
  // console.log(num);
  if (num > 0) {
    let data = {
      data: {
        id: id,
        quantity: num
      }
    }
    axios.patch(`${url}/${api_path}/carts`, data)
      .then(function (response) {
        // console.log(response);
        cartData = response.data.carts;
        totalPrice = response.data.finalTotal;
        renderCartList(cartData,totalPrice);

      })
      .catch(function (error) {
        console.log(error);
      })
  }
  else {
    alert("數量不能小於1")
    return;
    // deleteCart(id);
    
  }
}
//取得購物車列表
function getCartList(){
  axios.get(`${url}/${ api_path }/carts`)
  .then(function(response){
    // console.log(response);
    cartData = response.data.carts;
    totalPrice = response.data.finalTotal;
    // console.log(totalPrice);
    renderCartList(cartData,totalPrice);
  })
}
//加入購物車
function addCart(id,num=1){
  cartData.forEach(function(item){
    if(item.product.id == id){
      num = item.quantity+=1;
    }
  })
  axios.post(`${url}/${api_path}/carts`,{
    data: {
      productId: id,
      quantity: num
    }
  }).
    then(function (response) {
      alert("該商品已成功加入購物車");
      // getCartList();
      cartData = response.data.carts;
      totalPrice = response.data.finalTotal;
      renderCartList(cartData,totalPrice);
  })
}
//刪除購物車特定產品
function deleteCart(id){
  axios.delete(`${url}/${api_path}/carts/${id}`)
  .then(function (response) {
    // getCartList()
    cartData = response.data.carts;
    totalPrice = response.data.finalTotal;
    renderCartList(cartData,totalPrice);
    alert("成功刪除該商品！");
  })
}
//刪除購物車全部產品
function deleteAllCart(e){
  e.preventDefault();
  axios.delete(`${url}/${api_path}/carts`)
  .then(function (response) {
      alert("購物車內全部商品刪除成功！");
      // getCartList();
      cartData = response.data.carts;
      totalPrice = response.data.finalTotal;
      renderCartList(cartData,totalPrice);
  })
  .catch(function (response) {
    alert("購物車全部商品已清空，請勿重複點擊！")
  })
}
// 送出訂單
function addOrder() {
  if(cartData.length==0){
    alert("購物車目前無選購產品");
    return;
  }
  let customerName = document.querySelector('#customerName').value.trim();
  let customerPhone = document.querySelector('#customerPhone').value.trim();
  let customerEmail = document.querySelector('#customerEmail').value.trim();
  let customerAddress = document.querySelector('#customerAddress').value.trim();
  let customerTradeWay = document.querySelector('#tradeWay').value.trim()
  let apiUrl = `${url}/${api_path}/orders`;
  let data = {
    data: {
      user: {
        name: customerName,
        tel: customerPhone,
        email: customerEmail,
        address: customerAddress,
        payment: customerTradeWay
      }
    }
  }
  axios.post(apiUrl, data)
    .then(function (response) {
      alert("訂單建立成功");

      // 顯示訂單結果
    //  console.log(response.data);
     document.querySelector("#customerName").value="";
     document.querySelector("#customerPhone").value="";
     document.querySelector("#customerEmail").value="";
     document.querySelector("#customerAddress").value="";
     document.querySelector("#tradeWay").value="ATM";
      getCartList();
    })
    .catch(function (error) {
      console.log(error);
    })
}
//驗證套件設定條件
const constraints = {
  "姓名": {
    presence: {
      message: "是必填欄位"
    }
  },
  "電話":{
    presence: {
      message: "是必填欄位"
    },
    length: {
      minimum: 8,
      message: "號碼需超過 8 碼"
    }
  },
  "Email":{
    presence: {
      message: "是必填欄位"
    },
    email: {
      message: "格式有誤"
    }
  },
  "寄送地址":{
    presence: {
      message: "是必填欄位"
    }
  },
  "交易方式":{
    presence: {
      message: "是必填欄位"
    },
  }
};
const inputs = document.querySelectorAll("input[type=text],input[type=tel],input[type=email]");
// 取得所有帶有data-message 的 p 標籤
let messages = document.querySelectorAll('[data-message]');
// 綁定整個 form 表單，驗證成功才准許送出表單
form.addEventListener("submit", verification, false);
function verification(e) {
  e.preventDefault();
  let errors = validate(form, constraints);
  // 如果有誤，呈現錯誤訊息  
  if (errors) {
    showErrors(errors);
  } else {
    // 如果沒有錯誤，送出表單
    addOrder();
  }
}
function showErrors(errors) {
  messages.forEach(function(item) {
    item.textContent = "";
    for (let index = 0; index < alertMsg.length; index++) {
      alertMsg[index].style.display = "block";
    }
    item.textContent = errors[item.dataset.message];
  })
}
// 監控所有 input 的操作
inputs.forEach(function(item){
  item.addEventListener("change", function(e) {
    e.preventDefault();
    // console.log(item);
    let targetName = item.name;
    let errors = validate(form, constraints);
    item.nextElementSibling.textContent = "";
    // 針對正在操作的欄位呈現警告訊息
    if(errors){
      document.querySelector(`[data-message='${targetName}']`).textContent = errors[targetName];
    }
  });
});
function searchFilter(e){
  let searchData = [];
  if (e.target.value == "全部"){
    searchData = productData;
  } 
  else {
    productData.forEach(function(item) {
      //當使用者所選擇的選項和arry的資料符合，就將符合的物件資料寫入
      if (e.target.value == item.category){
        searchData.push(item);
      }
    })
  }
  renderProductList(searchData);
}
cartList.addEventListener('click',function(e){
  e.preventDefault();
  let cartId = e.target.getAttribute('data-id');
  let className = e.target.getAttribute('class');
  // console.log(className);
  if(cartId == null){
    return;
  }
  else if(className == "material-icons cartAmount-icon"){
    let productId = e.target.dataset.id;
    let num = parseInt(e.target.dataset.num);
    // console.log(ptId,num);
    editCartNum(num,productId)
    return;
  }
  deleteCart(cartId);
})
buyBtn.addEventListener('click',function(e){
  e.preventDefault();
  let productId = e.target.getAttribute('data-id');
  let addClass = e.target.getAttribute('class');
  if(addClass!=="js-addCart"){
    return;
  }
  addCart(productId);
})
deleteBtn.addEventListener('click',function(e){
  deleteAllCart(e);
})
selectOption.addEventListener('change',function(e){
  searchFilter(e);
})
//千分位驗證
function toThousands(x) {
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
init();
