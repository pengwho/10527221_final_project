function rand_int(a, b){
    return Math.floor(Math.random() * (b - a + 1)) + a
}

function rand_elem(xs){
    if (xs instanceof Set){
        xs = Array.from(xs)
    }
    return xs[rand_int(0, xs.length - 1)]
}

function time_format_seconds(){
    return performance.now() / 1000
}

function play_sound_effect(id){
    // makes sure that sound effect plays from start even when it's still playing
    aud = document.getElementById(id)
    aud.pause()
    aud.currentTime = 0
    aud.play()
}

new Vue({
    el: "#app",
    data: {
        game_started: false,
        game_ended: false,
		is_radical: false,
        response: "",
        answer: 42,

        first_num: null,
        second_num: null,

        op: null,
        ops: {0:'+', 1:'-', 2:'*', 3:'/', 4:'√', 5:'%'},
        op_symbols: {'+':'+', '-':'−', '*':'⋅', '/':'/', '√':'√', '%':'%'},
        ops_used: [true, true, true, true, true, true],
        active_ops: [0, 1, 2, 3, 4, 5],
        button_names: ['toggle-plus', 'toggle-minus', 'toggle-times', 'toggle-divide', 'toggle-radical', 'toggle-mod'],

        n_smallest: 1,
        n_largest: 99,

        start_time: null,
        response_times: [],
        avg_time: 0,
        score: 0,
        target_score: 50,

        low_selected: 1,
        high_selected: 2,
        options: [1, 2, 3, 4],

        checked: true,
    },
    methods: {
        start_game(){
            this.score = 0;
            this.game_started = true;
            this.new_problem();
            this.start_time = time_format_seconds();
        },
        end_game(){
            this.game_ended = false;
            this.game_started = false;
			this.is_radical = false;
        },
        new_problem(){
            this.n_smallest = Math.pow(10, this.low_selected - 1);
            this.n_largest = Math.pow(10, this.high_selected) - 1;
            this.is_radical = false; // iniz
            this.first_num = rand_int(this.n_smallest, this.n_largest);
            this.second_num = rand_int(this.n_smallest, this.n_largest);

            this.op = this.ops[rand_elem(this.active_ops)];
            if (this.op == '/'){
                // special case for division, treat as multiplication in reverse
                [this.first_num, this.answer] = [this.first_num * this.second_num, this.first_num]
            } else if(this.op == '√') {
			  this.is_radical = true;	
			  [this.first_num, this.answer] = [this.first_num * this.first_num, this.first_num]
			} else {
                this.answer = eval(this.first_num + ' ' + this.op + ' ' + this.second_num);
            }
            this.response = "";
        },
        toggle_op(op_id){
            play_sound_effect("audio_buttons");
            if (op_id < 0){
                op_id = - op_id - 1
                for (let i = 0; i < 6; i ++){
                    if ((i === op_id) !== this.ops_used[i]){
                        document.getElementById(this.button_names[i]).click();
                    }
                }
            } else {
                this.ops_used[op_id] = !this.ops_used[op_id];
                if (!this.ops_used.includes(true)){
                    // alert("must use at least one operator!");
                    document.getElementById(this.button_names[op_id]).click();
                }
                this.active_ops = Object.keys(this.ops).filter(x => this.ops_used[x]);
                console.log(this.active_ops)
            }
        },
    },
    computed: {
        check_response(){
            isCorrect = this.response === String(this.answer);
            now = time_format_seconds();

            if (isCorrect){
                // Add to times
                // after adding, floats become inaccurate again, so use toFixed
                this.response_times.push(parseFloat((now - this.start_time).toFixed(2)));
                sum = this.response_times.reduce((previous, current) => current += previous);
                console.log(sum)
                this.avg_time = sum / this.response_times.length;
                console.log(this.avg_time)
                this.start_time = now;

                this.score ++;

                if (this.score >= this.target_score){
                    play_sound_effect("audio_applause");
                    sum = this.response_times.reduce((previous, current) => current += previous);
                    this.avg_time = parseFloat(sum / this.response_times.length).toFixed(2);
                    this.start_time = now;
                    this.game_ended = true;
                } else {
                    play_sound_effect("audio_success");
                    this.new_problem();
                }
            }
			else if (this.response === 's'){ // user skips question
                this.start_time = now;
                this.new_problem();
            } 
            console.log(this.response_times)
        },
    },
    mounted(){
        window.addEventListener('keyup', e => {
            // Enter key to start game
            if (e.keyCode === 13 && !this.game_started){
                this.start_game();
            }
            else if (e.keyCode === 13 && this.game_ended){
                this.end_game();
            }
        });
    }
});
// Register a global custom directive called `v-focus`
Vue.directive('focus', {
    // When the bound element is inserted into the DOM...
    inserted: function (el) {
        // Focus the element
        el.focus()
    }
})