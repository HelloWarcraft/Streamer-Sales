import { ref } from 'vue'
import { ElMessage } from 'element-plus'

import { request_handler, type ResultPackage } from '@/api/base'
import type { StreamerInfo } from '@/api/streamerInfo'

// 调用登录接口数据结构定义
type ProductListType = {
  // accessToken: string // 登录验证 header
  currentPage?: number // 当前页号
  pageSize?: number // 每页记录数
  productName?: string // 商品名称
  product_class?: string // 商品分类
}

interface ProductListItem {
  user_id: string // User 识别号，用于区分不用的用户调用
  request_id: string // 请求 ID，用于生成 TTS & 数字人
  product_id: number
  product_name: string
  product_class: string
  heighlights: string
  image_path: string
  instruction: string
  departure_place: string
  delivery_company: string
  selling_price: number
  amount: number
  upload_date: string
  sales_doc: string
  digital_human_video: string
  streamer_id: number
}

interface ProductData {
  product: ProductListItem[]
  current: number
  pageSize: number
  totalSize: number
}

// 查询 - 条件
const queryCondition = ref<ProductListType>({
  currentPage: 1,
  pageSize: 10
} as ProductListType)

// 查询 - 结果
const queriedResult = ref<ProductData>({} as ProductData)

// 查询 - 方法
const getProductList = async (params: ProductListType = {}) => {
  Object.assign(queryCondition.value, params) // 用于外部灵活使用，传参的字典更新
  const { data } = await productListRequest(queryCondition.value)
  if (data.code === 0) {
    queriedResult.value = data.data
  } else {
    ElMessage.error('商品接口错误')
    throw new Error('商品接口错误')
  }
}

// 接口

// 查询接口
const productListRequest = (params: ProductListType) => {
  return request_handler<ResultPackage<ProductData>>({
    method: 'POST',
    url: '/products/list',
    data: params
  })
}

// 查询制定商品的信息接口
const getProductByIdRequest = (productId: string) => {
  return request_handler<ResultPackage<ProductListItem>>({
    method: 'GET',
    url: '/products/info/',
    params: {
      // 使用 query 的方式去获取
      productId
    }
  })
}

// 添加或者更新商品接口
const productCreadeOrEditRequest = (params: ProductListType) => {
  console.info(params)

  return request_handler<ResultPackage<ProductData>>({
    method: 'POST',
    url: '/products/upload/form',
    data: params
  })
}

// 使用说明书总结生成商品信息解耦
const genProductInfoByLlmRequest = (salesDoc: string) => {
  return request_handler({
    method: 'POST',
    url: '/llm/gen_product_info',
    data: salesDoc
  })
}

// 根据 ID 获取说明书内容
const genProductInstructionContentRequest = (instructionPath_: string) => {
  return request_handler({
    method: 'POST',
    url: '/products/instruction',
    data: { instructionPath: instructionPath_ }
  })
}

export {
  type ProductListItem,
  type StreamerInfo,
  queryCondition,
  queriedResult,
  getProductList,
  productCreadeOrEditRequest,
  genProductInfoByLlmRequest,
  getProductByIdRequest,
  genProductInstructionContentRequest
}