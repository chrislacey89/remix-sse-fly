function add(x, y) {
  x + y;
}

const thunk = function () {
  return add(1, 2);
};
thunk(); // 3
