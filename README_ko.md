# 프로젝트: 동네지도(Neighborhood Map) 앱

동네지도(Neighborhood Map) 앱은 세계 여러 나라의 도시들에서 사람들이 자주 방문하는 상점, 커피숍, 유명 관광지 등을 지도에 표시하여 주는 SPA(Single Page Application)입니다. 기본적으로 대한민국의 부산 지역을 보여주며, 검색을 통해 다른 도시들의 자주 찾는 장소를 확인할 수 있습니다. 이 앱은 [Udacity의 풀스택 웹개발자 과정](https://www.udacity.com/course/full-stack-web-developer-nanodegree--nd004)의 일환으로 [구글 지도](https://developers.google.com/maps/)와  [Foursquare](https://developer.foursquare.com/)의 위치기반서비스 API를 활용하여 제작되었습니다.

## 데모
데모 웹사이트 URL: https://neighborhoodmap.youngsappworkshop.com

## 설치 방법
GitHub 저장소를 복제(Clone)하고 아래와 같이 플라스크(flask) 앱을 설치합니다.

```
git clone https://github.com/YoungsAppWorkshop/neighborhood-map
cd neighborhood-map
pip3 install -r requirements.txt
```

동네지도(Neighborhood Map) 앱은 [구글 지도](https://developers.google.com/maps/) 및 [Foursquare](https://developer.foursquare.com/) API를 기반으로 제작되었기 때문에, 로컬환경에서 설치하고 테스트하기 위해서는 각 API 서비스를 등록하고 `api_secrets.json` 파일에 관련 정보를 저장해야 정상적으로 동작합니다.

## 어플리케이션 시작
API 관련정보를 `api_secrets.json` 파일에 저장한 후, 아래와 같이 어플리케이션을 시작합니다:

```
python3 run.py
```

## 어플리케이션 구조
```bash
/neighborhood-map
    /app
        /static
            /js
                app.js              # 동네지도앱 자바스크립트 애플리케이션
            /css
            /img
        /templates
            neighborhood_map.html
        __init__.py
        neighborhood_map.py         # 동네지도앱 플라스크 애플리케이션
    api_secrets.json                # API 시크릿 정보
    config.py                       # 플라스크 설정 파일
    README_ko.md
    requirements.txt
    run.py                          # 앱 시작하기
```

## 참고자료
아래는 참고 자료 및 이미지의 출처입니다.
- [TodoMVC Knockout.js example](http://todomvc.com/examples/knockoutjs/)
- [Customizing the Google Maps Infowindow](https://codepen.io/Marnoto/pen/xboPmG)
- [Resizing Google Maps](http://jsfiddle.net/n5c01zw5/)
- [Animate.css](https://daneden.github.io/animate.css/)
- Google Maps Marker icons: [Green](https://pixabay.com/en/poi-location-pin-marker-position-304466/) / [Red](https://pixabay.com/en/location-poi-pin-marker-position-304467/)
- [No Image Icon](https://www.iconfinder.com/icons/103591/cancel_image_icon#size=128)
- [loading.gif](https://preloaders.net/)
- [404 Page Not Found Image](https://pixabay.com/en/not-found-website-error-page-404-1770320/)


## 저작권
[MIT 라이센스](/LICENSE)
