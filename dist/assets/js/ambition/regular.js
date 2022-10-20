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

  $("#submit").on('click',sendMail);

});

/**
 * 他の社員の記事にとぶ
 */
const toOtherPerson = function(index) {
  window.location.href=`interview0${index}.html`;
};  


const sendMail = function(_event) {
    const contactInfo = $('#contactInfo').val();
    const companyName = $('#companyName').val();
    const tel = $('#tel').val();
    const replyTo = $('#mail').val();
    const name = $('#name').val();
    const title = $('#title').val();
    const text = $('#content').val();

    const checkObj = checkForm(replyTo,title,name,text,contactInfo);

    if (!checkObj.contactInfo ) {
      if (!$('#contact-info-error').length) {
        $('#contactInfo').after('<p id="contact-info-error" class="text-red-500 mt-4 ml-2 text-xs">問い合わせ先のお名前を入力してください</p>');
      }
    } else if ($('#contact-info-error').length) {
      $('#contact-info-error').remove();
    };

    if (!checkObj.name ) {
      if (!$('#name-error').length) {
        $('#name').after('<p id="name-error" class="text-red-500 mt-4 ml-2 text-xs">お名前を入力してください</p>');
      }
    } else if ($('#name-error').length) {
      $('#name-error').remove();
    };

    if (!checkObj.replyTo) {
      if (!$('#mail-error').length) {
        $('#mail').after('<p id="mail-error" class="text-red-500 mt-4 ml-2 text-xs">メールアドレスを正しい形式で入力してください</p>');
      }
    } else if ($('#mail-error').length) {
      $('#mail-error').remove();
    }

    if (!checkObj.title) {
      if (!$('#title-error').length) {
        $('#title').after('<p id="title-error" class="text-red-500 mt-4 ml-2 text-xs">件名を入力してください</p>');
      }
    } else if ($('#title-error').length) {
      $('#title-error').remove();
    }    

    if (!checkObj.text) {
      if (!$('#text-error').length) {
        $('#content').after('<p id="text-error" class="text-red-500 mt-4 ml-2 text-xs">お問い合わせ内容を入力してください</p>');
      }
    } else if ($('#text-error').length) {
      $('#text-error').remove();
    }
    
    if (Object.keys(checkObj).find(k => !checkObj[k])) {
      return
    }
    

    const confirmText = "お問い合わせ内容を送信して宜しいでしょうか？"
    const confirmed = window.confirm(confirmText);
    if (!confirmed) {
      return
    }
    $('#loading').removeClass('hidden');
    const URL = "https://matroos.tokyo/.netlify/functions/mail";
    return $.ajax({
      type: "POST",
      url: URL,
      data: JSON.stringify( {
        url: location.href,
        contactInfo: contactInfo,
        companyName: companyName,
        name: name,
        tel: tel,
        replyTo: replyTo,
        title: title,
        text: text        
      })
    })
    .done((_data,_status,xhr) => {
      $('#loading').addClass('hidden');
      if (xhr.status === 200) {
        $('#contactInfo').val('');
        $('#name').val('');
        $('#companyName').val('');
        $('#tel').val('');
        $('#mail').val('');
        $('#title').val('');
        $('#content').val('');
        $('#loading').addClass('hidden');
        alert('お問い合わせが完了しました。');
      } else {
        $('#contactInfo').val('');
        $('#name').val('');
        $('#companyName').val('');
        $('#tel').val('');
        $('#mail').val('');
        $('#title').val('');
        $('#content').val('');
        $('#loading').addClass('hidden');
        alert('お問い合わせ中に予期せぬエラーが発生しました。');
      }
    })
    .catch((_e) => {
      $('#contactInfo').val('');
      $('#name').val('');
      $('#companyName').val('');
      $('#tel').val('');
      $('#mail').val('');
      $('#title').val('');
      $('#content').val('');
      $('#loading').addClass('hidden');
      alert('お問い合わせ中に予期せぬエラーが発生しました。');
    })
}

const checkForm = (replyTo,title,name,text,contactInfo) => {
  const regExp = new RegExp('^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$');
  const result =  regExp.test(replyTo);
  return {
    name: !!name,
    replyTo: result,
    title: !!title,
    text: !!text,
    contactInfo: !!contactInfo
  }
}