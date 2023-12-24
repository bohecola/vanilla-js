// 深拷贝
export function cloneDeep(origin) {
  if (origin == undefined || typeof origin !== "object") {
    return origin;
  }

  const target = new origin.constructor();

  for(key in origin) {
    if (origin.hasOwnProperty(key)) {
      target[key] = cloneDeep(origin[key]);
    }
  }

  return target;
}

// 数组扁平化
export function flat1(arr) {
  while (arr.some(Array.isArray)) {
    arr = [].concat(...arr);
  }
  return arr;
}

export function flat2(arr) {
  return arr.reduce((prev, item) => {
    return prev.concat(Array.isArray(item) ? flat2(item) : item);
  }, []);
}

// 快速排序
export function quickSort() {
  if (arr.length < 1) return arr;
  const pivotIdx = Math.floor(arr.length / 2);
  const pivot = arr.splice(pivotIdx, 1)[0];

  const left = [];
  const right = [];

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }

  return quickSort(left).concat(pivot, quickSort(right));
}

// 冒泡排序
export function bubbleSort(arr) {
	for(let i = 0; i < arr.length - 1; i++) {
		for(let j = 0; j < arr.length - 1 - i; j++) {
			if (arr[j] > arr[j+1]) {
				const temp = arr[j];
				arr[j] = arr[j+1];
				arr[j+1] = temp;
			}
		}
	}
	return arr;
}
