// 冒泡排序
function bubbleSort(arr) {
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

// 插入排序
function insertionSort(arr) {
  let preIndex, current;
  for (let i=1; i<arr.length; i++) {
    preIndex = i - 1;
    current = arr[i];
    while(preIndex >=0 && arr[preIndex] > current) {
      arr[preIndex+1] = arr[preIndex];
      preIndex--;
    }
    arr[preIndex+1] = current;
  }
  return arr;
}

// 选择排序
function selectionSort(arr) {
  let minIdx, temp;
  for(let i=0; i<arr.length-1; i++) {
    minIdx = i;
    for(let j=i+1; j<arr.length; j++) {
      if (arr[j] < arr[minIdx]) { // 寻找最小数
        minIdx = j;               // 将最小数的索引保存
      }
    }
    temp = arr[i];
    arr[i] = arr[minIdx];
    arr[minIdx] = temp;
  }
  return arr;
}

// 归并排序
function mergeSort(arr) {
  if (arr.length < 2) {
    return arr;
  }
  const middle = Math.floor(arr.length / 2);
  const left = arr.slice(0, middle);
  const right = arr.slice(middle);
  return merge(mergeSort(left), mergeSort(right));
}

function merge(left, right) {
  const result = [];

  while (left.length && right.length) {
    if (left[0] <= right[0]) {
      result.push(left.shift());
    } else {
      result.push(right.shift());
    }
  }

  while(left.length)
    result.push(left.shift());
  while(right.length)
    result.push(right.shift());
  
  return result;
}

// 快速排序
function quickSort(arr, left, right) {
  let len = arr.length;
  let partitionIndex;
  left = typeof left != "number" ? 0 : left;
  right = typeof right != "number" ? len - 1 : right;

  if (left < right) {
    partitionIndex = partition(arr, left, right);
    quickSort(arr, left, partitionIndex-1);
    quickSort(arr, partitionIndex+1, right);
  }
  return arr;
}

function partition(arr, left, right) { // 分区操作
  let pivot = left;                    // 设定基准值（pivot）
  let index = pivot+1;
  for (let i=index; i<=right; i++) {
    if (arr[i] < arr[pivot]) {
      swap(arr, i, index);
      index++;
    }
  }
  swap(arr, pivot, index-1);
  return index-1;
}

function swap(arr, i, j) {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}