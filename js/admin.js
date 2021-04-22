const menuOpenBtn = document.querySelector('.menuToggle');
const linkBtn = document.querySelectorAll('.topBar-menu a');
const menu = document.querySelector('.topBar-menu');
const orderList = document.querySelector('.order');
const orderdeleteBtn = document.querySelector('.discardAllBtn');
let orderData = [];
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
function showC3chart(){
  //資料蒐集
  let total={};
  orderData.forEach(function(item){
    item.products.forEach(function(productItem){
      if(total[productItem.category]==undefined){
        total[productItem.category] = productItem.price*productItem.quantity;
      }else{
        total[productItem.category] += productItem.price * productItem.quantity;
      }
    })
  })
  // console.log(total);//{收納: 2670, 床架: 3600, 窗簾: 9000}
  let c3Data=[];
  let newAry = Object.keys(total);
  // console.log(newAry);//["收納", "床架", "窗簾"]
  newAry.forEach(function(item){
    let combination = [];
    combination.push(item);//["收納"], ["床架"], ["窗簾"]
    // console.log(combination);
    combination.push(total[item])//["收納", 2670],["床架", 3600],["窗簾",  9000]
    // console.log(combination);
    c3Data.push(combination);//[["收納", 2670],["床架", 3600],["窗簾",  9000]]
  })
  let chart = c3.generate({
    bindto: '#chart-All', // HTML 元素綁定
    data: {
        type: "pie",
        columns: c3Data,
        colors:{
        }
    },
});
}
function showC3chart_lv2() {
  //資料蒐集
  let obj = {};
  orderData.forEach(function (item) {
    item.products.forEach(function (productItem) {
      if (obj[productItem.title] === undefined) {
        obj[productItem.title] = productItem.quantity * productItem.price;
      } else {
        obj[productItem.title] += productItem.quantity * productItem.price;

      }
    })
  });
  // console.log(obj);
  
  // 拉出資料關聯
  let originAry = Object.keys(obj);
  // console.log(originAry);
  // 透過 originAry，整理成 C3 格式
  let rankSortAry = [];
  
  originAry.forEach(function (item) {
    let ary = [];
    ary.push(item);
    ary.push(obj[item]);
    rankSortAry.push(ary);
  });
  // console.log(rankSortAry);
  /*尚未排序前
    [
      ["Antony 床邊桌", 1890],
      ["Antony 遮光窗簾", 3600],
      ["Jordan 雙人床架／雙人加大", 9000],
      ["Charles 系列儲物組合", 780]
    ]
  */
   // 比大小，降冪排列（目的：取營收前三高的品項當主要色塊，把其餘的品項加總起來當成一個色塊）
   rankSortAry.sort(function (a, b) {
    return b[1] - a[1];//A,B取出為array，array[1]取出數值做大小排列
  })
   /*排序後[
    ["Jordan 雙人床架／雙人加大", 9000],
    ["Antony 遮光窗簾", 3600],
    ["Antony 床邊桌", 1890],
    ["Charles 系列儲物組合", 780]
  ]
  */
   // // 如果筆數超過 4 筆以上，就統整為其它
   if (rankSortAry.length > 3) {
    let otherTotal = 0;
    rankSortAry.forEach(function (item, index) {
      if (index > 2) {
        otherTotal += rankSortAry[index][1];
      }
    })
    rankSortAry.splice(3, rankSortAry.length - 1);
    rankSortAry.push(['其他', otherTotal]);
    
  }
  // 超過三筆後將第四名之後的價格加總起來放在 otherTotal
  // console.log(rankSortAry);
  /*重新整理後
  [
    ["Jordan 雙人床架／雙人加大", 9000],
    ["Antony 遮光窗簾", 3600],
    ["Antony 床邊桌", 1890],
    ["其他", 780]
  ]
  */
  // c3 圖表
  c3.generate({
    bindto: '#chart-category',
    data: {
      columns: rankSortAry,
      type: 'pie',
    },
    color: {
      pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"]
    }
  });
}
function init(){
    getOrderList();
}
function getOrderList(){
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`,headers)
    .then(function (response) {
      // console.log(response.data);
      orderData = response.data.orders;
      renderOrderList(orderData);
      showC3chart();
      showC3chart_lv2();
    })
}
function renderOrderList(orderData){
  console.log(orderData);
  let str ="";
  if(orderData.length==0){
    str +=`<tr>
    <td colspan="8"><p style="text-align:center">目前無訂單資料</p></td>
    </tr>`
  }
    orderData.forEach(function (item){
      // 組產品字串
      let productStr = "";
      item.products.forEach(function (productItem){
        productStr += `<p>${productItem.title}x${productItem.quantity}</p>`
      })
    // 判斷訂單處理狀態
    let orderStatus="";
    if(item.paid){
      orderStatus="已處理";
    }else{
      orderStatus = "未處理";
    }
    // 組時間字串
    const timeStamp = new Date(item.createdAt*1000);
    let year = timeStamp.getFullYear();
    let month = timeStamp.getMonth() + 1;
    let day = timeStamp.getDate();
    // 若月份是 1~9 就補 0
    if (month < 10) {
      month = `0${month}`;
    }
    //若日期是 1 ~ 9 那就補 0
    if (day < 10) {
      day = `0${day}`;
    }
    const orderTime = `${year}/${month}/${day}`;
    // 組訂單字串
    str +=`<tr>
    <td>${item.id}</td>
    <td>
      <p>${item.user.name}</p>
      <p>${item.user.tel}</p>
    </td>
    <td>${item.user.address}</td>
    <td>${item.user.email}</td>
    <td>
      ${productStr}
    </td>
    <td>${orderTime}</td>
    <td class="js-orderStatus">
      <a href="#" data-status="${item.paid}" class="orderStatus" data-id="${item.id}">${orderStatus}</a>
    </td>
    <td>
      <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
    </td>
    </tr>`
  })

    orderList.innerHTML = str;
}
function deleteOrder(id){
  axios.delete(`${adminUrl}/${api_path}/orders/${id}`,headers)
  .then(function(response){
    alert("該筆訂單已成功刪除");
    // getOrderList();
    orderData = response.data.orders;
    renderOrderList(orderData)
    showC3chart();
    showC3chart_lv2();
  })
}
function deleteAllOrder(){
  axios.delete(`${adminUrl}/${api_path}/orders`,headers)
  .then(function (response) {
    alert("全部訂單皆成功刪除");
    // getOrderList();
    orderData = response.data.orders;
    renderOrderList(orderData)
    showC3chart();
    showC3chart_lv2();
  })
  .catch(function (error) {
    alert("目前已無剩餘訂單可刪除");
  })
}
//更改訂單
function changeOrder(status,id){
  console.log(status);
  let newStatus;
  if(status=="true"){
    newStatus=false;
  }else{
    newStatus=true;
  }
  axios.put(`${adminUrl}/${api_path}/orders`,
  {
    data: {
      id: id,
      paid: newStatus
    }
  },headers)
  .then(function (response) {
    alert("修改訂單狀態成功");
    // getOrderList();
    orderData = response.data.orders;
    renderOrderList(orderData)
  })
}
orderList.addEventListener('click', function(e){
  e.preventDefault();
  let className = e.target.getAttribute('class');
  let orderId = e.target.getAttribute('data-id');
  let status = e.target.getAttribute("data-status");
  if(className == "delSingleOrder-Btn js-orderDelete"){
    deleteOrder(orderId);
    return;
  }
  else if (className == "orderStatus"){
    changeOrder(status,orderId);
    return;
  }
})
orderdeleteBtn.addEventListener('click',function(e){
  e.preventDefault();
  deleteAllOrder();
})
init();