$(function() {
  $(document).ready(function() {
    window.scroll({top:0})
    $("#profile, #scroll-induction").addClass('block-in');
  });
  /**
   * スクロール時に要素がでたら表示される処理
   */
  $(window).on('scroll',function() {
    $(".scroll-block").each(function() {
      let scroll = $(window).scrollTop();
      let blockPosition = $(this).offset().top;
      let windowHeihgt = $(window).height();
      if (scroll > blockPosition - windowHeihgt + 100) {
        $(this).addClass("block-in");
      }
    });
  });

});

/**
 * 他の社員の記事にとぶ
 */
const toOtherPerson = function(index) {
  window.location.href=`interview0${index}.html`;
};  


const sendMail = function(mail) {
    const URL = `https://www.matroos.com/.netlify/functions/mail}`;
    return $.get(URL, {mail: mail})
    .then(({ data: data }) => {
      if (data.status) {
          window.location.href="../../contact/complete.html"
      } else {
        window.location.href="../../contact/fail.html"
      }
    })
    .catch((_e) => {
        window.location.href="../../contact/fail.html"
    })
}