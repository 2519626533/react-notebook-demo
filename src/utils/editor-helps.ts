import type { VSPosition } from '@/types/components'
import type { CustomElement } from '@/types/slate'
import type { DependencyList } from 'react'
import { type Descendant, Element } from 'slate'
import { SlateElementHeight } from './enums'

type ExtendedDescendant = Descendant & {
  startIndex?: number
  endIndex?: number
  lineNumber?: number
}

// 扁平化数组
export const flatArr = (value: Descendant[]): ExtendedDescendant[] => {
  const flattedArr: Descendant[] = []
  value.forEach((item) => {
    if (Element.isElement(item)) {
      if (item.children.length > 1) {
        const len = item.children.length
        const newItem: ExtendedDescendant = { ...item }
        const startIndex = (item.children[0] as CustomElement).lineNumber
        const endIndex = (item.children[len - 1] as CustomElement).lineNumber
        newItem.startIndex = startIndex
        newItem.endIndex = endIndex
        flattedArr.push(newItem)
        item.children.forEach((item) => {
          flattedArr.push(item)
        })
      } else {
        flattedArr.push(item)
      }
    }
  })
  return flattedArr
}

// visibleState.position初始化
export const positionInit = (
  flattedArr: ExtendedDescendant[],
  initItemHeight: number,
): VSPosition[] => {
  if (flattedArr.length === 0) {
    return [{
      index: 0,
      height: initItemHeight,
      top: 0,
      bottom: initItemHeight,
      dHeight: 0,
    }]
  }
  const positions: VSPosition[] = []
  flattedArr.forEach((item: ExtendedDescendant) => {
    let index = item.lineNumber
    if (index) {
      index--
      const itemHeight = SlateElementHeight[item.type] ?? initItemHeight
      const top = index === 0 ? 0 : positions[index - 1].bottom
      positions.push({
        index,
        height: itemHeight,
        top,
        bottom: top + itemHeight,
        dHeight: 0,
      })
    }
  })
  return positions
}

export const binarySearch = (
  positions: VSPosition[],
  value: number,
): number => {
  let start: number = 0
  let end: number = positions.length - 1
  let tempIndex = 0
  while (start <= end) {
    const midIndex = Number.parseInt(String((start + end) / 2))
    const midValue = positions[midIndex].bottom
    if (midValue === value) {
      return midIndex + 1
    } else if (midValue < value) {
      start = midIndex + 1
    } else if (midValue > value) {
      if (tempIndex === 0 || tempIndex > midIndex) {
        tempIndex = midIndex
      }
    }
    end = end - 1
  }
  return tempIndex
}

// 比较依赖是否相同
export const depsAreSame = (oldDeps: DependencyList, deps: DependencyList): boolean => {
  if (oldDeps === deps)
    return true
  for (let i = 0; i < oldDeps.length; i++) {
    if (!Object.is(oldDeps[i], deps[i])) {
      return false
    }
  }
  return true
}

// 添加proxy代理拦截
export const observer = <T extends Record<string, any>>(initialVal: T, cb: () => void): T => {
  const proxy = new Proxy(initialVal, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver)
      return typeof res === 'object'
        ? observer(res, cb)
        : Reflect.get(target, key)
    },
    set(target, key, val) {
      const res = Reflect.set(target, key, val)
      cb()
      return res
    },
  })
  return proxy
}
