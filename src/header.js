import Config from './config'
import { RecordStorage, keepDouble, isMobile } from './util'

const MaxRecordNumber = Config.RECORDS

// AppHeader component definition
const Sugar = window.Sugar
const Header = Sugar.Component.extend({
    init (config) {
        this.Super('init', config, {
            class: 'header',
            css: {
                width: `${Config.WIDTH}px`,
                'border-width': Config.BORDER + 'px'
            },
            template: './template/header.html',
            model: {
                isMobile,
                score: 0,
                broke: 0,
                records: [],
                minute: '--',
                secound: '--'
            },
            cbRender: 'initState'
        })
    },

    initState () {
        this.minute = 0
        this.secound = 0
        this.timer = null
        this.over = false

        this.setRecordList()
    },

    // set records from storage
    setRecordList () {
        const storeRecords = RecordStorage.get()
        if (storeRecords.length > MaxRecordNumber) {
            storeRecords.length = MaxRecordNumber
        }

        this.vm.set('records', storeRecords)
    },

    // start to count game time
    startTime () {
        this.timer = window.setTimeout(() => {
            this.secound++

            if (this.secound === 60) {
                this.minute++
                this.secound = 0
            }

            this.vm.set({
                minute: keepDouble(this.minute),
                secound: keepDouble(this.secound)
            })

            this.startTime()
        }, 1000)
    },

    // pause game time
    pauseTime (force) {
        if (this.timer || force) {
            window.clearTimeout(this.timer)
            this.timer = null
        } else if (!this.over) {
            this.startTime()
        }
        return this
    },

    // game over
    end () {
        this.over = true
        this.updateRecords()
        this.saveRecords()
        this.pauseTime(true)
    },

    // add score with eaten an bug
    addScore () {
        let data = this.vm.$data
        data.score = data.score + Config.SCORE

        if (data.broke !== 1) {
            const { index, isEqual } = this.findRecordIndex()
            if (index > -1 && index < 3 && !isEqual) {
                data.broke = index + 1
            }
        }
    },

    // find the record index
    findRecordIndex () {
        const { score, records } = this.vm.$data

        let index = -1
        let isEqual = false
        for (let i = 0; i < records.length; i++) {
            const record = records[i]
            if (score >= record.score) {
                index = i
                isEqual = score === record.score
                break
            }
        }

        return {
            index,
            isEqual
        }
    },

    updateRecords () {
        const { score, records } = this.vm.$data
        const length = records.length
        const lastRecord = records[length - 1]
        const limit = length >= MaxRecordNumber

        if (limit && score < lastRecord.score) {
            return
        }

        const nowRecord = {
            score,
            times: 1
        }

        const { index, isEqual } = this.findRecordIndex(score)

        // if qualified record
        if (index > -1) {
            if (isEqual) {
                records[index].times++
            } else {
                records.splice(index, 0, nowRecord)
            }
        }

        // avoid overflow
        if (records.length > MaxRecordNumber) {
            records.splice(MaxRecordNumber, records.length - MaxRecordNumber)
        }
    },

    // if records update, save to storage
    saveRecords () {
        const { score, records } = this.vm.$data

        if (!score) {
            return
        }

        // first play
        if (!records.length) {
            const _records = [{
                score,
                times: 1
            }]
            RecordStorage.set(_records)
            this.vm.$data.records = _records
        } else {
            RecordStorage.set(records)
        }
    },

    // reset component, be ready to restart
    reset () {
        this.pauseTime(true)
        this.vm.reset()
        this.initState()
    }
})

export default Header
