// ref: https://github.com/howdy39/google-picker-api-demo/blob/master/docs/index.html

// The Browser API key obtained from the Google Developers Console.
var developerKey = 'AIzaSyCrQKCG_Ly61zaO6-ba93BjTTb_W6v_r4Y';

// The Client ID obtained from the Google Developers Console. Replace with your own Client ID.
var clientId = "836573439566-pannen061gqgreoo4qv1na39on7smtpd.apps.googleusercontent.com";

// Scope to use to access user's photos.
var scope = ['https://www.googleapis.com/auth/photos'];

var authApiLoaded = false;
var pickerApiLoaded = false;
var oauthToken;
var viewIdForhandleAuthResult;

// Use the API Loader script to load google.picker and gapi.auth.
function onApiLoad() {
  gapi.load('auth', {'callback': onAuthApiLoad});
  gapi.load('picker', {'callback': onPickerApiLoad});
}

function onAuthApiLoad() {
  authApiLoaded = true;
}

function onPickerApiLoad() {
  pickerApiLoaded = true;
}

function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    oauthToken = authResult.access_token;
    createPicker(true);
  }
}

// Create and render a Picker object for picking user Photos.
function createPicker(setOAuthToken) {
  if (authApiLoaded && pickerApiLoaded) {
    var picker;

    if(authApiLoaded && oauthToken && setOAuthToken) {
      picker = new google.picker.PickerBuilder().
        addView(google.picker.ViewId.PHOTOS).
        enableFeature(google.picker.Feature.MULTISELECT_ENABLED).
        setOAuthToken(oauthToken).
        setDeveloperKey(developerKey).
        setCallback(pickerCallback).
        build();

      picker.setVisible(true);
    }
  }
}

// callback implementation.
function pickerCallback(data) {
  var result_text = '<p>埋め込みタグは未生成です</p>';

  if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {

    // アルバム情報を取得
    var album = data[google.picker.Response.PARENTS][0];

    // 日付フォーマットをmoment.jsで扱う
    moment.locale("ja");

    // ここはあたらしくオブジェクトを作る必要はないけど..
    var pick_album_info = new Object();
    pick_album_info["album_name"] = album["name"];
    pick_album_info["album_updated_date"] = moment(album["lastEditedUtc"]).utc().format();
    pick_album_info["album_audience"] = album["audience"];

    // 選択した写真
    var doc = data[google.picker.Response.DOCUMENTS];
    console.log(doc);

    // 選択した画像の各jsonから"thumbnails"Array内の最後のオブジェクト型内にあるurlを取り出す。結果は複数のurlのarrayが生成される
    var select_img_urls = doc.map(
      function get_thum_url(currentValue, index, array){
        // TODO:2018/04/01 16:05 多分thumbnail用いらないから除去してもよし
          // サムネイル用
          // var thum_obj = currentValue["thumbnails"].slice(-1)[0];
          // 埋め込みタグ用:
          var embed_obj = currentValue["thumbnails"].slice(-1)[0];
          var name = currentValue["name"]
          return ({
                  // "thum_obj":thum_obj,
                  "embed_obj":embed_obj,
                  "pict_name":name,
                  });
      });

    // dom描写するタグを生成する
    var embed_tags_str = '';
    for (var img_i = 0; img_i < select_img_urls.length; img_i++){

      // imgタグを生成する
      var embed_pic_name = select_img_urls[img_i].pict_name
      var embed_obj = select_img_urls[img_i].embed_obj
      var html_embed_tag_str = `<img src="${embed_obj.url}" width="${embed_obj.width}" height="${embed_obj.height}">`
      var md_embed_tag_str = `![${embed_pic_name}](${embed_obj.url})`

      // カードセクションを生成
      embed_tags_str = embed_tags_str + `
        <section class="embed_code_card section--center mdl-grid mdl-grid--no-spacing mdl-shadow--2dp">
          <header class="section__play-btn mdl-cell mdl-cell--3-col-desktop mdl-cell--2-col-tablet mdl-cell--4-col-phone mdl-color--teal-100 mdl-color-text--white">
            <div class="mdl-card__media">
              <img src="${select_img_urls[img_i].embed_obj.url}" alt="">
            </div>
          </header>
          <div class="mdl-card mdl-cell mdl-cell--9-col-desktop mdl-cell--6-col-tablet mdl-cell--4-col-phone">
            <div class="mdl-card__supporting-text">
              <h4>${embed_pic_name}</h4>
              <div class="html_embed_code_area">
                <p>HTML</p>
                <textarea id="html_code" name="embed_tag" rows="1" onclick="this.select()">${html_embed_tag_str}</textarea>
              </div>

              <div class="markdown_embed_code_area">
                  <p>Markdown</p>
                  <input type="text" id="markdown_code" value="${md_embed_tag_str}" onclick="this.select()">
            </div>
          </div>
          <div class="mdl-menu__container is-upgraded"><div class="mdl-menu__outline mdl-menu--bottom-right"></div><ul class="mdl-menu mdl-js-menu mdl-menu--bottom-right" for="btn1" data-upgraded=",MaterialMenu">
            <li class="mdl-menu__item" tabindex="-1">Lorem</li>
            <li class="mdl-menu__item" disabled="" tabindex="-1">Ipsum</li>
            <li class="mdl-menu__item" tabindex="-1">Dolor</li>
          </ul></div>
        </section>
      `;

    }

    // アルバム情報を含めたタグを生成
    result_text = `
    <table  class="mdl-data-table mdl-js-data-table">
      <tr>
        <td>アルバム名</td>
        <td>${pick_album_info["album_name"]}</td>
      </tr>
      <tr>
        <td>audience(公開範囲)</td>
        <td>${pick_album_info["album_audience"]}</td>
      </tr>
    </table>
    ${embed_tags_str}
    `;
  }
  document.getElementById('result').innerHTML = result_text;
}