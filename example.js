function add(x, y, callback) {
    setTimeout(function(){
        callback(x + y);
    }, 1000);
}

const thunk = function () {
  return add(1, 2);
};
thunk(); // 3
