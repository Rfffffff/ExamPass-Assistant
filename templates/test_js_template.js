const Q = __QUESTIONS_PLACEHOLDER__;
const LABELS = __LABELS_PLACEHOLDER__;

(function build(){
  var h='',sec='';
  var titles = LABELS.section;
  Q.forEach(function(q,i){
    var s = q.type === 'choice' ? 'choice'
          : q.type === 'tf' ? 'tf'
          : i < 24 ? 'short'
          : i < 27 ? 'essay'
          : 'comprehensive';
    if (s !== sec) { sec = s; h += '<h3>' + titles[sec] + '</h3>'; }
    var qid = 'q' + i;
    h += '<div class="q-card" id="card-' + qid + '">';
    h += '<div class="q-num">' + (i+1) + '. (' + q.points + ' ' + LABELS.points_suffix + ')</div>';
    h += '<div class="q-text">' + q.question + '</div>';
    if (q.type === 'choice') {
      q.options.forEach(function(o,j){
        h += '<label class="option" id="opt-' + qid + '-' + j + '" onclick="sel(' + JSON.stringify(qid) + ',' + j + ')">';
        h += '<input type="radio" name="' + qid + '" value="' + j + '">' + String.fromCharCode(65+j) + '. ' + o + '</label>';
      });
    } else if (q.type === 'tf') {
      h += '<label class="option" id="opt-' + qid + '-0" onclick="sel(' + JSON.stringify(qid) + ',0)"><input type="radio" name="' + qid + '" value="0">' + LABELS.true_label + '</label>';
      h += '<label class="option" id="opt-' + qid + '-1" onclick="sel(' + JSON.stringify(qid) + ',1)"><input type="radio" name="' + qid + '" value="1">' + LABELS.false_label + '</label>';
    } else {
      h += '<textarea class="q-textarea" id="text-' + qid + '" placeholder="' + LABELS.placeholder + '" rows="3"></textarea>';
    }
    h += '<div class="result" id="result-' + qid + '">';
    h += '<span class="badge" id="badge-' + qid + '"></span><span id="correct-' + qid + '"></span>';
    h += '<div class="explanation">' + q.explanation + '</div>';
    if (q.pitfall) h += '<div class="pitfall">' + LABELS.pitfall_prefix + q.pitfall + '</div>';
    h += '</div></div>';
  });
  document.getElementById('questions-container').innerHTML = h;
})();

function sel(qid, idx) {
  var opts = document.querySelectorAll('[id^="opt-' + qid + '"]');
  for (var i = 0; i < opts.length; i++) opts[i].classList.remove('selected');
  document.getElementById('opt-' + qid + '-' + idx).classList.add('selected');
  document.querySelector('input[name="' + qid + '"][value="' + idx + '"]').checked = true;
}

function gradeAll() {
  var score = 0;
  Q.forEach(function(q,i){
    var qid = 'q' + i;
    var card = document.getElementById('card-' + qid);
    var result = document.getElementById('result-' + qid);
    var badge = document.getElementById('badge-' + qid);
    var correctEl = document.getElementById('correct-' + qid);
    result.style.display = 'block';
    if (q.type === 'choice' || q.type === 'tf') {
      var sel = document.querySelector('input[name="' + qid + '"]:checked');
      if (sel && parseInt(sel.value) === q.answer) {
        score += q.points;
        card.classList.add('correct');
        badge.className = 'badge badge-ok';
        badge.textContent = LABELS.correct_label;
        correctEl.innerHTML = '';
        document.getElementById('opt-' + qid + '-' + q.answer).classList.add('correct-answer');
      } else {
        card.classList.add('wrong');
        badge.className = 'badge badge-no';
        badge.textContent = LABELS.wrong_label;
        var ansText = q.type === 'choice'
          ? String.fromCharCode(65+q.answer) + '. ' + q.options[q.answer]
          : (q.answer === 0 ? LABELS.true_label : LABELS.false_label);
        correctEl.innerHTML = LABELS.answer_prefix + ansText;
        if (sel) document.getElementById('opt-' + qid + '-' + sel.value).classList.add('wrong-answer');
        document.getElementById('opt-' + qid + '-' + q.answer).classList.add('correct-answer');
      }
    } else {
      card.classList.add('correct');
      badge.className = 'badge badge-ref';
      badge.textContent = LABELS.reference_label;
    }
  });
  var sb = document.getElementById('score-box');
  sb.style.display = 'block';
  document.getElementById('score-num').textContent = score;
  sb.scrollIntoView({behavior:'smooth'});
  var opts = document.querySelectorAll('.option');
  for (var i = 0; i < opts.length; i++) opts[i].style.pointerEvents = 'none';
  var tas = document.querySelectorAll('.q-textarea');
  for (var i = 0; i < tas.length; i++) tas[i].disabled = true;
  var btn = document.getElementById('grade-btn');
  btn.disabled = true;
  btn.textContent = LABELS.graded_label;
}
