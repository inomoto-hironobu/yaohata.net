const formdata = new FormData();
formdata.append("consumer_key",window.pocket_key);
formdata.append("redirect_uri","pocketapp1234:authorizationFinished");

await fetch("https://getpocket.com/v3/oauth/request",{
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF8",
      'X-Accept': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: formdata, // 本体のデータ型は "Content-Type" ヘッダーと一致させる必要があります
  })
  .then((response)=>response.formData())
  .then((data)=>{
    data.get("code");
  });

