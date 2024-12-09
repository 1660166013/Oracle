import request from '@/utils/request';

export function byPrefix(prefix) {
  return request({
    url: '/search/byPrefix',
    method: 'get',
    params: { prefix },
  });
}

export function byAncientRhyme(ancientRhyme) {
  return request({
    url: '/search/byAncientRhyme',
    method: 'get',
    params: { ancientRhyme },
  });
}

export function byAncientVoices(ancientVoices) {
  return request({
    url: '/search/byAncientVoices',
    method: 'get',
    params: { ancientVoices },
  });
}

export function bySpeakingRadicals(speakingRadicals) {
  return request({
    url: '/search/bySpeakingRadicals',
    method: 'get',
    params: { speakingRadicals },
  });
}
