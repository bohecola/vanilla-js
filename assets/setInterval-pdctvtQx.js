const n=`// setTimeout 实现 setInterval
function newInterval(func, delay) {
	function inside() {
		func();
		setTimeout(inside, delay);
	}
	// 上来走一次，放入任务队列
	setTimeout(inside, delay);
}

function taskLog() {
	console.log("task is running.");
}
newInterval(taskLog, 1000);`;export{n as default};
