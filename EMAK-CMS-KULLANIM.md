# EMAK CMS – Kullanım

## CMS'yi açma
Site GitHub Pages'e yüklendikten sonra:

`https://emakmimarlik.com.tr/cms/`

CMS arama motorlarına kapalıdır (`noindex`). İçerikler önce tarayıcının yerel hafızasına kaydedilir.

## Yeni rehber ekleme
1. **Yeni Rehber** ekranını açın.
2. Başlık, kategori, açıklama ve kısa cevap alanlarını doldurun.
3. Bölümleri ve en az 3 sık sorulan soruyu ekleyin.
4. Durumu **Yayında** olarak seçin.
5. **Taslağı Kaydet** düğmesine basın.
6. Önizlemeyi kontrol edin.

## Site dosyalarını güncelleme – önerilen yöntem
Bu yöntem Chrome veya Edge masaüstünde çalışır.

1. GitHub projenizi bilgisayarınıza ZIP olarak indirin ve klasöre çıkarın.
2. CMS'de **Yayınlama** bölümüne girin.
3. **Proje Klasörünü Seç** düğmesine basın.
4. İçinde `index.html`, `style.css` ve diğer site dosyalarının bulunduğu ana klasörü seçin.
5. **Değişiklikleri Projeye Yaz** düğmesine basın.
6. Güncellenen klasörü GitHub'a yükleyin.

CMS otomatik olarak şunları oluşturur/günceller:
- Yayındaki tüm rehberlerin HTML dosyaları
- `rehberler.html`
- `sitemap.xml`
- `llms.txt`
- `cms/data/guides.json`

## Safari kullanımı
Safari klasöre otomatik yazma özelliğini desteklemeyebilir. Bu durumda **Değişen Dosyaları İndir** düğmesini kullanın ve indirilen dosyaları GitHub'a yükleyin.

## Yedekleme
Her büyük değişiklikten sonra **CMS Yedeğini İndir** düğmesiyle JSON yedeği alın.

## Güvenlik notu
Bu ilk sürüm statik ve tarayıcı tabanlıdır; bir sunucu veritabanına veya GitHub hesabınıza kendiliğinden bağlanmaz. Bu nedenle GitHub şifresi ya da erişim anahtarı istemez. Dosyaları yalnızca sizin açıkça seçtiğiniz yerel proje klasörüne yazar.
