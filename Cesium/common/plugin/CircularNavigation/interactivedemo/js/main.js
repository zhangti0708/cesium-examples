var steps = $('.steps'),
    wrapper = $('.cn-wrapper'),
    items = $('.cn-wrapper li'),
    anchors = $('.cn-wrapper li a'),
    reset = $('.reset-button'),
    play = $('.play-button');

var step = 1;
$('.step-button').on('click', function(e){
  e.preventDefault();
  $('.reset-button').removeAttr('disabled');
  play.attr('disabled', 'disabled');

  switch (step)
  {
      case 1: step1(); break;
      case 2: step2(); break;
      case 3: step3(); break;
      case 4: step4(); break;
      case 5: step5(); break;
      case 6: step6(); break;
      case 7: step7(); break;
  }
  step++;
  if(step > 7){
    reset.trigger('click');
    step = 1;
  }
});

function step1(){
      items.css({
        'left': '50%',
        'top': '50%',
        'margin-top': '-1.3em',
        'margin-left': '-10em',
        'overflow': 'hidden'
      });
      steps.html('Items are moved so that their transform origin (bottom right corner) coincides with the container\'s center, and their overflow is hidden');
  
  }

  function step2(){
    items.each(function(i, el){
      var angle = i * 40 - 10;
      $(this).css({
        'transform': 'rotate('+angle+'deg) skew(50deg)'
      });
    });
    steps.html('Items are rotated, each item is rotated by: (index of item * value of central angle) - 10deg, and then they are skewed by: 90deg - value of central angle');
  }
  
  function step3(){
     anchors.css({
      'transform': 'skew(-50deg) rotate(-70deg) scale(1)',
      'border-radius': '50%',
      'text-align': 'center',
      'padding-top': '2em'
    });
    steps.html('Anchors inside each item are positioned absolutely, unskewed, rotated by -(90 - central-angle/2) and their text is aligned at the center so that their content is visible');
  }
  
  function step4(){
    wrapper.css('border-radius', '50%');
    steps.html('Container is rounded');
  }
  
  function step5(){
    wrapper.css('overflow', 'hidden');
    steps.html('Container\'s overflow is hidden (the items are cut off)');
  }
  
  function step6(){
    wrapper.css('bottom', '-13em');
     steps.html('Container (whole navigation) is positioned at the bottom');
    reset.removeAttr('disabled');
  }

reset.on('click', function(){
  $('*').attr('style', '');
  step = 1;
  play.removeAttr('disabled');
  $('.step-button').removeAttr('disabled');
  $(this).attr('disabled', 'disabled');
  steps.html('List items are positioned absolutely. Anchor tags inside them are also positioned absolutely, and their size is given so that they are visible at the end of the transformation. Red dot represents the container\'s center.');
});


play.on('click', function(e){
  
  e.preventDefault();
  $(this).attr('disabled', 'disabled');
  $('.step-button').attr('disabled', 'disabled');

  step1();

  setTimeout(function(){
    step2();
  }, 2000);
  
  setTimeout(function(){
    step3();
  }, 5000);
  
  setTimeout(function(){
    step4();
  }, 10000);
  
  setTimeout(function(){
   step5();
  }, 15000);
  
   setTimeout(function(){
    step6();
  }, 18000);
  
   setTimeout(function(){
    step7();
  }, 21000);
    
});

