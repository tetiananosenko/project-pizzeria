class Home {
  constructor() {
    const thisHome = this;
    thisHome.initCarrousel();
  }
  initCarrousel() {
    let counter = 1;
    setInterval(function () {
      document.getElementById('radio' + counter).checked = true;
      counter++;
      if (counter > 3) {
        counter = 1;
      }
    }, 3000);
  }
}
export default Home;