const n=`class Node{
  constructor(element, parent){
    this.element = element;
    this.parent = parent;
    this.left = null;
    this.right = null;
  }
}

class BST{
  constructor(compare){
    this.root = null;
    this.size = 0;
    this.compare = compare || this.compare;
  }

  add(element){
    if(this.root === null){
      this.root = new Node(element, null);
      this.size++;
      return;
    }else {
      let currentNode = this.root;
      let parent = null;
      let compare = 0;
      while(currentNode){
        // compare = element - currentNode.element;
       compare =  this.compare(element, currentNode.element);
        parent = currentNode;
        if(compare > 0){
          currentNode = currentNode.right;
        }else{
          currentNode = currentNode.left;
        }
      }
      let newNode = new Node(element, parent);

      if(compare > 0){
        parent.right = newNode;
      }else{
        parent.left = newNode;
      }
      this.size++;
    }
  }

  compare(a, b){
    return a -b;
  }
  //前序遍历;
  preorderTraversal(){
    const traversal = (node) => {
      if(node === null)  return;
      console.log(node.element);
      traversal(node.left);
      traversal(node.right);
    }

    traversal(this.root);
  }

  inorderTraversal(visitor){
    if(visitor === null)  return ;
    const traversal = (node) => {
      if(node === null)  return;
      
      traversal(node.left);
      //console.log(node.element);
      visitor.visit(node);
      traversal(node.right);
    }

    traversal(this.root);
  }

  postorderTraversal(){
    const traversal = (node) => {
      if(node === null)  return;
      traversal(node.left);
      traversal(node.right);
      console.log(node.element);
    }

    traversal(this.root);
  }

  levelOrderTraversal(visitor){

    if(this.root == null || visitor == null) return ;

    let arr = [this.root];

    let index =0;
    let currentNode = null;

    while(currentNode === arr[index++]){
      visitor.visit(currentNode);
      if(currentNode.left){
        arr.push(currentNode.left)
      }

      if(currentNode.right){
        arr.push(currentNode.right);
      }
    }

  }

  invertTree(){
    if(this.root == null ) return ;

    let arr = [this.root];
    let index =0;
    let currentNode = null;

    while(currentNode === arr[index++]){
      let temp = currentNode.left;
      currentNode.left = currentNode.right;
      currentNode.right = temp;

      if(currentNode.left){
        arr.push(currentNode.left)
      }

      if(currentNode.right){
        arr.push(currentNode.right);
      }
    }

    return this.root;
  }
}

//let arr = [10, 8, 6, 19, 15 , 22 , 20];
let arr = [{name:'zhangsan1', age: 10},
    {name:'zhangsan2', age: 8},
    {name:'zhangsan3', age: 6},
    {name:'zhangsan4', age: 19},
    {name:'zhangsan5', age: 15},
    {name:'zhangsan6', age: 22},
    {name:'zhangsan7', age: 20},
    ];

    //arr.sort((a, b) => {a.age -b.age});
let bst = new BST((a ,b) => {
   return a.age - b.age;
});

arr.forEach(item => {
  bst.add(item);
})

console.dir(bst, {
  depth: 100
});

// 访问者模式;  控制中转;
// bst.levelOrderTraversal({
//   visit(node){
//     console.log(node.element);
//   }
// })

console.dir(bst.invertTree(), {
  depth: 100
});


// 1. 前序遍历(先序遍历)：先访问根节点， 然后是左子树， 右子树;(纵深的过程)
// 2. 中序遍历;  左子树  根节点  右子树  (从大到小排列)
// 3. 后序遍历  左子树  右子树  根节点  (先要操作所有子树)
// 4. 层序遍历; 至上而下遍历所有节点;`;export{n as default};
