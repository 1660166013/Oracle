import request from '@/utils/request';
export function ocrpredict(prefix) {
  return request({
    url: '/predict',
    method: 'post',
    params: { prefix },
  });
}
