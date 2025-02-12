let eventBus = new Vue();

Vue.component('note', {
    props: {
        record_data: {
            type: Object,
            default() {
                return {}
            }
        },

        notes: {
            type: Array,
            default() {
                return {}
            }
        },

        idColumn: {
            type: Object,
            default() {
                return {}
            }
        },

        about:{
            type: Object,
            default() {
                return {}
            }
        }
    },

    data() {
        return {
            taskTitle: null,
            task: [],
        }
    },

    methods: {
        // слушатель на то, что добавляется в первую колонку
        column1Move() {
            this.$emit('column1_move')
        },

        // слушатель на кнопку удаления
        delNote() {
            this.$emit('del_note')
        },

        // слушатель на то, что добавляется в первую колонку
        column2ChangeLeft() {
            this.$emit('column2_move_left')
        },

        // слушатель на то, что добавляется в первую колонку
        column2Move() {
            this.$emit('column2_move')
        },

        // создание заявки
        addTask() {
            if (this.taskTitle) {
                this.record_data.tasks.push({
                    taskTitle: this.taskTitle,
                    completed: false,
                });
                this.taskTitle = null;
                this.updateCompletedNum();
                this.save();
            }
        },

        // добавление заявок в колонке
        updateCompletedNum() {
            let counterCompleted = 0;
            let counterNotCompleted = 0;
            for (let el of this.record_data.tasks) {
                if (el.completed) {
                    counterCompleted++;
                } else {
                    counterNotCompleted++;
                }
            }
            this.record_data.completedNum = (counterCompleted / (counterCompleted + counterNotCompleted)) * 100;
        },

        checkbox(id) {
            this.record_data.tasks[id].completed = !this.record_data.tasks[id].completed;
            this.updateCompletedNum();
            this.save();
        },

    },

    template: `
    <div class="note" >
            <div class="note_title_block">
                <h2 class="note_title">{{record_data.note}}</h2>
                <button @click="delNote()">удалить</button>
            </div>
        <div class="tasks">
                <div v-for="(element, elementId) in record_data.tasks" :key="elementId" class="task">
                    <div class="set_task">
                        <h3 class="title_task">{{element.taskTitle}}</h3>
                        <input @click="checkbox(elementId),column1Move(),column2Move(),column2ChangeLeft()" 
                               type="checkbox" 
                               v-model="element.completed" 
                               :class="{none: record_data.completedNum === 100, disabled: record_data.completedNum > 50 && element.completed && about.lengthColumn1 === 3}" >
                    </div>
                    
                    <div class="date" v-if="record_data.date">
                        <p>{{record_data.time}}</p>
                        <p>{{record_data.date}}</p>
                    </div>
                </div>
        </div>
    </div>
    `,
})

let app = new Vue({
    el: '#app',
    data: {
        note: null,
        recordOne: null,
        recordTwo: null,
        recordThree: null,
        completed: false,
        about:{
            signal: false,
            bufColumn: [],
            id: null,
            lengthColumn1: null
        },

        column1: {
            notes: [],
            idColumn: 'СТОЛБЕЦ 1',
        },

        column2: {
            notes: [],
            idColumn: 'СТОЛБЕЦ 2'
        },

        column3: {
            notes: [],
            idColumn: 'СТОЛБЕЦ 3'
        }
    },

    computed: {

    },

    methods: {
        // создание самой заявки, нельзя больше трех заявок создавать в первую колонку
        creatingRecord() {
            if (this.note && this.column1.notes.length < 3 && this.recordOne && this.recordTwo && this.recordThree) {
                this.column1.notes.push({
                    note: this.note,
                    tasks: [
                        {
                            taskTitle: this.recordOne,
                            completed: this.completed
                        },
                        {
                            taskTitle: this.recordTwo,
                            completed: this.completed
                        },
                        {
                            taskTitle: this.recordThree,
                            completed: this.completed
                        }
                    ],
                    completedNum: 0,
                });
                this.note = null;
                this.recordOne = null;
                this.recordTwo = null;
                this.recordThree = null
                localStorage.todo = JSON.stringify(this.column1.notes);
            }
            this.length()
        },

        // чтобы в первой колонки, если половина сделана то переходит на некст столбец
        changeColumn1(id) {
            if (this.column1.notes[id].completedNum > 50 && this.column2.notes.length <= 5) {
                if (this.column2.notes.length === 5) {
                    this.about.signal = true;
                    this.about.bufColumn.push(this.column1.notes[id])
                    this.about.id = id
                }

                else if(this.about.bufColumn[0] && this.column2.notes.length === 4){
                    this.column2.notes.push(this.about.bufColumn[0])
                    this.about.bufColumn.splice(0, 1)
                    this.column1.notes.splice(this.about.id, 1)
                }

                else {
                    this.column2.notes.push(this.column1.notes[id])
                    this.column1.notes.splice(id, 1)
                }
            }
            this.length()
            localStorage.todo = JSON.stringify(this.column1.notes);
            localStorage.todo2 = JSON.stringify(this.column2.notes);
            localStorage.about = JSON.stringify(this.about)
        },

        // если выполнено 100% то переходит в третью колонку
        changeColumn2(id) {
            if (this.column2.notes[id].completedNum === 100) {
                this.times(id);
                this.column3.notes.push(this.column2.notes[id]);
                this.column2.notes.splice(id, 1);
                this.changeColumn1(this.about.id)
                this.about.signal = false
            }
            localStorage.todo2 = JSON.stringify(this.column2.notes);
            localStorage.todo3 = JSON.stringify(this.column3.notes);
            localStorage.about = JSON.stringify(this.about)
        },
    },
})