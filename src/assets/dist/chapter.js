var book;
var mangCfi = [];
var mangChapter = [];
var linkEpub = '';
var rendition;

function themDefault() {
  rendition.themes.default({
    body: {
      background: "#f5c542",
    },
    h2: {
      'font-size': '32px',
      color: 'purple',
    },
    p: {
      "margin": '10px',
    }
  });

  rendition.themes.select("tan");
  rendition.themes.fontSize("140%");
}

function khoiTao() {
  const trang = document.querySelector('#book');
  trang.innerHTML = '';
  book = ePub(linkEpub);
    rendition = book.renderTo('book', {
      flow: "auto",
      width: "100%",
      height: 600,
      manager: "continuous"
    });
}

function nextChapter(index) {
  $('.menu-toc').removeClass('chay');
  $('.hide-an').show()

  rendition.display(mangCfi[index])
  $("#pagination").removeClass('hide')
}

function themFontNau() {
  // khoiTao()
  $('.menu-option').removeClass('chay');
  $('.hide-an').show()
  rendition.themes.default({
    body: {
      'font-family': "'The Nautigal', cursive"
    }
  })
  rendition.display()
   $("#pagination").removeClass('hide')
}

function themBlack() {
  // khoiTao()
  $('.menu-option').removeClass('chay');
  $('.hide-an').show()
  rendition.themes.default({
    body: {
      background: "black",
      color: "#ccc",
    },
    h2: {
      'font-size': '32px',
      color: 'purple',
    },
    p: {
      "margin": '10px',
    }
  })
  rendition.display()
   $("#pagination").removeClass('hide')
}

function themBlue() {
  // khoiTao()
  $('.menu-option').removeClass('chay');
  $('.hide-an').show()
  rendition.themes.default({
    body: {
      background: "#03fce3",
      color: "black"
    },
    h2: {
      'font-size': '32px',
      color: 'purple',
    },
    p: {
      "margin": '10px',
    }
  })
  rendition.display()
   $("#pagination").removeClass('hide')
}

function themYellow() {
  // khoiTao()
  $('.menu-option').removeClass('chay');
  $('.hide-an').show()
  rendition.themes.default({
    body: {
      background: "tan",
      color: "black"
    },
    h2: {
      'font-size': '32px',
      color: 'purple',
    },
    p: {
      "margin": '10px',
    }
  })
  rendition.display()
   $("#pagination").removeClass('hide')
}

