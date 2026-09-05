/*
  一个极小的 IndexedDB 键值存储，只为存 FileSystemDirectoryHandle 而存在。

  为什么不能用 localStorage：目录 handle 是个「可结构化克隆」的宿主对象，
  localStorage 只能存字符串，JSON.stringify 之后它就变成 {} 了，
  拿回来也不再是能访问文件的 handle。IndexedDB 走的是结构化克隆算法，
  可以原样存取 handle —— 这是这个 API 做持久化的唯一办法。

  刻意不引 idb 之类的封装库：这里只需要「读一个 / 写一个 / 删一个」三件事。
*/

import { AppError } from './app-error'

const DB_NAME = 'jotter'
const DB_VERSION = 1
const STORE = 'kv'

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  const opening = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => {
      const db = req.result
      // 连接被外力关掉（DevTools 清站点数据、别的标签页升级了库版本）后，
      // 这个 db 上的每次 transaction 都会抛 InvalidStateError。把缓存清掉，下次重新 open。
      db.onversionchange = () => {
        db.close()
        if (dbPromise === opening) dbPromise = null
      }
      db.onclose = () => {
        if (dbPromise === opening) dbPromise = null
      }
      resolve(db)
    }
    req.onerror = () => reject(req.error ?? new AppError('err.idb.open'))
    // 隐私模式或站点数据被清理时可能直接被拒
    req.onblocked = () => reject(new AppError('err.idb.blocked'))
  }).catch((err) => {
    // 失败的 promise 不留在缓存里，否则一次失败会让后续所有调用永久失败
    if (dbPromise === opening) dbPromise = null
    throw err
  })

  dbPromise = opening
  return opening
}

// 把一次事务包装成 Promise。IDB 的正确完成信号是 transaction.oncomplete
// 而不是 request.onsuccess —— 后者触发时事务还没提交。
function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode)
        const req = fn(tx.objectStore(STORE))
        let value: T
        req.onsuccess = () => {
          value = req.result
        }
        tx.oncomplete = () => resolve(value)
        tx.onabort = () => reject(tx.error ?? new AppError('err.idb.abort'))
        tx.onerror = () => reject(tx.error ?? new AppError('err.idb.fail'))
      })
  )
}

export function idbGet<T>(key: string): Promise<T | undefined> {
  return run<T | undefined>('readonly', (store) => store.get(key) as IDBRequest<T | undefined>)
}

export function idbSet(key: string, value: unknown): Promise<unknown> {
  return run('readwrite', (store) => store.put(value, key))
}

export function idbDel(key: string): Promise<unknown> {
  return run('readwrite', (store) => store.delete(key))
}

/**
 * 申请「持久化」存储，降低浏览器在磁盘紧张时清掉我们这份 handle 的概率。
 * 不成功也无所谓，所以吞掉所有异常。
 */
export function requestPersistentStorage(): void {
  void navigator.storage?.persist?.().catch(() => {})
}
