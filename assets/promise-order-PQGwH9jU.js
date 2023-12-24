const e=`const p1 = new Promise((resolve, reject) => {
  console.log(1);

  setTimeout(() => {
    console.log("start");
    resolve(2)
    console.log("end");
  });
});

p1.then((res) => {
  console.log(res);
});`;export{e as default};
