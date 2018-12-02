export function isObject(obj: any) {
  return obj === Object(obj)
}

export function arrayUnique(array: any[]) {
  const u: any = {}
  const ret: any[] = []
  for (let i = 0, l = array.length; i < l; ++i) {
    if (u.hasOwnProperty(array[i]) && !isObject(array[i])) {
       continue
    }
    ret.push(array[i])
    u[array[i]] = 1
  }
  return ret
}

export function arrayInter(array: any[], ...rest: any[]) {
  return arrayUnique(array).filter(item => {
    let ret = true

    for (const other of rest) {
      if (other.indexOf(item) < 0) {
        ret = false
      }
    }

    return ret
  })
}

export function arrayDiff(array: any[], ...rest: any[]) {
  let inter = arrayInter(array, ...rest)
  let union = arrayUnique(array.concat(...rest))
  return union.filter(item => inter.indexOf(item) < 0)
}