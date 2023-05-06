import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

export default function redirect() {

  const {query} = useRouter()


  // async function getUser(){
  //   const user = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=` + query.code)
  //   console.log({user})
  //   console.log(user.data)
  // }
    

  useEffect( () => {
    if(!query.code) return
    // getUser()
  
    // return () => 
  }, [query])
  
  

  return (<>
    <h1>redirect</h1>
    <p>query: {query.code}</p>
  </>)
}
