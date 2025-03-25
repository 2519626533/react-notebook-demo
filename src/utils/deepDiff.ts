// 基础工具函数
type IndexableObject = { [key: string]: any }

export const isDate = (d: Date | any) => d instanceof Date
export const isObject = (o: object | any): boolean => o !== null && typeof o === 'object'
export const isEmpty = (o: object | any): boolean => {
  if (!isObject(o))
    return false
  return Object.keys(o).length === 0
}
export const hasOwnProperty = (o: object, ...args: [string | symbol]) =>
  Object.prototype.hasOwnProperty.call(o, ...args)
export const isEmptyObject = (o: object): boolean => isObject(o) && isEmpty(o)
export const createObjectWithoutPrototype = (): IndexableObject => Object.create(null)

export const deepDiff = (oldData: object, newData: object): IndexableObject => {
  // 如果新旧相等直接返回
  if (oldData === newData) {
    return {}
  }
  // 处理非对象数据
  if (!isObject(oldData) || !isObject(newData)) {
    return newData
  }
  // 处理日期数据
  if (isDate(oldData) || isDate(newData)) {
    return +oldData === +newData ? {} : newData
  }
  // 处理删除属性
  const deletedValues: IndexableObject = Object
    .keys(oldData)
    .reduce((acc: IndexableObject, key: string): object => {
      if (!hasOwnProperty(newData, key)) {
        acc[key] = undefined
      }
      return acc
    }, createObjectWithoutPrototype())

  // 处理新增/更新属性
  return Object
    .keys(newData)
    .reduce((acc: IndexableObject, key: string) => {
      if (!hasOwnProperty(oldData, key)) {
        acc[key] = (newData)[key]
        return acc
      }

      const difference = deepDiff(oldData[key], newData[key])

      if (isEmptyObject(difference) && !isDate(difference)
        && (isEmptyObject(oldData[key]) || !isEmptyObject(newData[key]))) {
        return acc
      }
      acc[key] = difference
      return acc
    }, deletedValues)
}
