import type { Language } from '../types';

type LocaleValue = string | Record<string, string | Record<string, string>>;
type LocaleData = Record<string, LocaleValue>;

const locales: Record<Language, LocaleData> = {
  'zh-CN': {
    common: {
      confirm: '确认',
      cancel: '取消',
      loading: '加载中...',
      error: '出错了',
      retry: '重试',
      submit: '提交',
      save: '保存',
      delete: '删除',
      search: '搜索',
      noData: '暂无数据',
      viewDetail: '查看详情',
      submitting: '提交中...',
      minutes: '分钟',
      hours: '小时',
    },
    parking: {
      parkingLot: '停车场',
      selectParkingLot: '选择停车场',
      availableSpaces: '剩余车位',
      totalSpaces: '总车位',
      pricePerHour: '元/小时',
      freeMinutes: '免费{minutes}分钟',
      maxDailyPrice: '最高{price}元/天',
      distance: '{distance}km',
      searchPlaceholder: '搜索停车场名称或地址',
      typeIndoor: '室内',
      typeOutdoor: '室外',
      typeUnderground: '地下',
    },
    plate: {
      title: '车牌号码',
      placeholder: '请输入车牌号码',
      invalid: '请输入正确的车牌号码',
      bind: '绑定车辆',
      unbind: '解绑',
      setDefault: '设为默认',
      myVehicles: '我的车辆',
      defaultTag: '默认',
    },
    order: {
      title: '停车订单',
      orderNo: '订单号',
      entryTime: '入场时间',
      exitTime: '出场时间',
      duration: '停车时长',
      totalAmount: '停车费用',
      discountAmount: '优惠金额',
      payableAmount: '应付金额',
      paidAmount: '实付金额',
      status: {
        parking: '停车中',
        pending: '待支付',
        paid: '已支付',
        completed: '已完成',
        cancelled: '已取消',
      },
    },
    coupon: {
      title: '优惠券',
      available: '可用优惠券',
      unavailable: '不可用优惠券',
      discount: '{value}折',
      amount: '减{value}元',
      freeHours: '免费{value}小时',
      expireTime: '有效期至 {time}',
      use: '立即使用',
      noAvailable: '暂无可用优惠券',
      minAmount: '满{amount}元可用',
      used: '已使用',
      expired: '已过期',
      discountSuffix: '折',
      couponSuffix: '优惠券',
      freeHoursSuffix: '免费时长',
    },
    payment: {
      title: '支付',
      selectMethod: '选择支付方式',
      wechat: '微信支付',
      alipay: '支付宝',
      balance: '余额支付',
      pay: '立即支付',
      paying: '支付中...',
      success: '支付成功',
      failed: '支付失败',
      result: '支付结果',
      backToHome: '返回首页',
      viewOrder: '查看订单',
      transactionId: '交易单号',
    },
    invoice: {
      pageTitle: '申请发票',
      type: '发票类型',
      personal: '个人',
      company: '企业',
      title: '发票抬头',
      taxNumber: '税号',
      email: '邮箱',
      emailPlaceholder: '请输入接收发票的邮箱',
      amount: '开票金额',
      submit: '提交申请',
      success: '申请成功',
      failed: '申请失败',
      ordersTitle: '开票订单',
      placeholderNamePersonal: '请输入个人姓名',
      placeholderNameCompany: '请输入公司名称',
      placeholderTaxNumber: '请输入纳税人识别号',
      errorName: '请输入姓名',
      errorCompany: '请输入公司名称',
      errorTaxNumber: '请输入纳税人识别号',
      errorEmail: '请输入邮箱地址',
      errorEmailInvalid: '请输入正确的邮箱地址',
    },
    monthlyCard: {
      title: '月卡',
      active: '已激活',
      expired: '已过期',
      frozen: '已冻结',
      remainingDays: '剩余{days}天',
      validPeriod: '有效期：{start} 至 {end}',
    },
    visitor: {
      title: '访客码',
      valid: '有效',
      used: '已使用',
      expired: '已过期',
      validate: '校验访客码',
      inputPlaceholder: '请输入访客码',
    },
    findCar: {
      title: '寻车',
      floor: '楼层',
      area: '区域',
      spot: '车位号',
      distance: '距离您 {distance}米',
      navigate: '导航到车位',
    },
  },
  'en-US': {
    common: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
      submit: 'Submit',
      save: 'Save',
      delete: 'Delete',
      search: 'Search',
      noData: 'No data',
      viewDetail: 'View Details',
      submitting: 'Submitting...',
      minutes: 'min',
      hours: 'h',
    },
    parking: {
      parkingLot: 'Parking Lot',
      selectParkingLot: 'Select Parking Lot',
      availableSpaces: 'Available Spaces',
      totalSpaces: 'Total Spaces',
      pricePerHour: '/hour',
      freeMinutes: '{minutes} min free',
      maxDailyPrice: 'Max {price}/day',
      distance: '{distance}km',
      searchPlaceholder: 'Search parking lot name or address',
      typeIndoor: 'Indoor',
      typeOutdoor: 'Outdoor',
      typeUnderground: 'Underground',
    },
    plate: {
      title: 'License Plate',
      placeholder: 'Enter license plate number',
      invalid: 'Please enter a valid license plate number',
      bind: 'Bind Vehicle',
      unbind: 'Unbind',
      setDefault: 'Set as Default',
      myVehicles: 'My Vehicles',
      defaultTag: 'Default',
    },
    order: {
      title: 'Parking Order',
      orderNo: 'Order No.',
      entryTime: 'Entry Time',
      exitTime: 'Exit Time',
      duration: 'Duration',
      totalAmount: 'Parking Fee',
      discountAmount: 'Discount',
      payableAmount: 'Amount Due',
      paidAmount: 'Amount Paid',
      status: {
        parking: 'Parking',
        pending: 'Pending Payment',
        paid: 'Paid',
        completed: 'Completed',
        cancelled: 'Cancelled',
      },
    },
    coupon: {
      title: 'Coupons',
      available: 'Available Coupons',
      unavailable: 'Unavailable Coupons',
      discount: '{value}% off',
      amount: '-{value}',
      freeHours: '{value} free hours',
      expireTime: 'Valid until {time}',
      use: 'Use Now',
      noAvailable: 'No available coupons',
      minAmount: 'Min {amount} required',
      used: 'Used',
      expired: 'Expired',
      discountSuffix: '% off',
      couponSuffix: 'Coupon',
      freeHoursSuffix: 'Free Hours',
    },
    payment: {
      title: 'Payment',
      selectMethod: 'Select Payment Method',
      wechat: 'WeChat Pay',
      alipay: 'Alipay',
      balance: 'Balance',
      pay: 'Pay Now',
      paying: 'Processing...',
      success: 'Payment Successful',
      failed: 'Payment Failed',
      result: 'Payment Result',
      backToHome: 'Back to Home',
      viewOrder: 'View Order',
      transactionId: 'Transaction ID',
    },
    invoice: {
      pageTitle: 'Apply for Invoice',
      type: 'Invoice Type',
      personal: 'Personal',
      company: 'Company',
      title: 'Invoice Title',
      taxNumber: 'Tax Number',
      email: 'Email',
      emailPlaceholder: 'Enter email to receive invoice',
      amount: 'Invoice Amount',
      submit: 'Submit Application',
      success: 'Application Submitted',
      failed: 'Application Failed',
      ordersTitle: 'Invoice Orders',
      placeholderNamePersonal: 'Enter your name',
      placeholderNameCompany: 'Enter company name',
      placeholderTaxNumber: 'Enter tax number',
      errorName: 'Please enter name',
      errorCompany: 'Please enter company name',
      errorTaxNumber: 'Please enter tax number',
      errorEmail: 'Please enter email address',
      errorEmailInvalid: 'Please enter a valid email address',
    },
    monthlyCard: {
      title: 'Monthly Card',
      active: 'Active',
      expired: 'Expired',
      frozen: 'Frozen',
      remainingDays: '{days} days remaining',
      validPeriod: 'Valid: {start} to {end}',
    },
    visitor: {
      title: 'Visitor Code',
      valid: 'Valid',
      used: 'Used',
      expired: 'Expired',
      validate: 'Validate Code',
      inputPlaceholder: 'Enter visitor code',
    },
    findCar: {
      title: 'Find My Car',
      floor: 'Floor',
      area: 'Area',
      spot: 'Spot No.',
      distance: '{distance}m away',
      navigate: 'Navigate to Spot',
    },
  },
};

export class I18n {
  private currentLanguage: Language;

  constructor(language: Language = 'zh-CN') {
    this.currentLanguage = language;
  }

  setLanguage(language: Language): void {
    this.currentLanguage = language;
  }

  getLanguage(): Language {
    return this.currentLanguage;
  }

  t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: unknown = locales[this.currentLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }

    if (typeof value === 'string' && params) {
      return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
        return String(params[paramKey] ?? `{${paramKey}}`);
      });
    }

    return typeof value === 'string' ? value : key;
  }
}
