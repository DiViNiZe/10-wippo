import axios from './axios'
import cookie from 'cookie'
import Router from 'next/router'
import getCookie from './cookie'

export const auth = async (res) => {
  let {data: {accessToken}} = await axios.post('/auth/login', { ...res }, null)
  document.cookie = cookie.serialize('token', accessToken, { maxAge: 60 * 60 * 24 * 5 })
  let {data, data: {id}} = await axios.post(`/auth/me`, null, {
    Authorization: `Bearer ${accessToken}`
  })
  console.log(data)
  window.localStorage.setItem('user', JSON.stringify(data))
  if (id) {
    let {data} = await axios.get(`/userroles/user_id/${id}`, {
      Authorization: `Bearer ${accessToken}`
    })
    console.log(data)
    let roles = await data.filter(data => data.role_id > 6)
    if (roles[0] && roles[0].role_id >= 6) {
      Router.pushRoute('/dashboard')
    } else {
      Router.pushRoute('/wait')
    }
  }
}

export const logout = async () => {
  let { token } = await getCookie({req: false})
  await axios.post('/auth/logout', null, {Authorization: `Bearer ${token}`})
  let allCookie = cookie.parse(document.cookie)
  for (const key of Object.keys(allCookie)) {
    document.cookie = await cookie.serialize(key, allCookie[key], { maxAge: 0 })
  }
  setTimeout(() => window.location.replace('https://wippo.wip.camp'), 2500)
}

export const postData = async res => {
  let { data } = await axios.post('/users', { ...res }, null)
  if (data) {
    return data
  }
  return null
}

export const getUserData = res => axios.post(`/users/${res.id}`, { ...res }, null)

export const responser = async (res, setToken) => {
  let user = await getUserData(res)
  if (!user.data.data) {
    user = await postData(res)
  }
  auth(res, setToken)
}
