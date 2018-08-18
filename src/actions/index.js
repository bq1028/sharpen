import utils from '../classes/utils'
import table from './table'

export default {

  ...table(),

  historyWrapper: ()=>(state, actions)=>{
    actions.history(JSON.parse(JSON.stringify(state))) 
  },
  onload: ()=>(state, actions)=>{
    console.log("onload gantt")
    parent.window.init(state)
  },

  // master member
  changeMasterMember: (params)=>(state)=>{
    console.log("changeMasterMember")
    Object.assign(state.member, {[params.id]: params.value})
    return {}
  },
  deleteMasterMember: (id)=>(state)=>{
    delete(state.member[id])
    return {}
  },

  save: () => (state) => {
    localStorage.setItem('state', JSON.stringify(state))
  },

  tasks: { 

    // tasks
    changeTodo: (params)=>(state)=>{
      globalUpdateId = params.id;
      let updatedTodo = Object.assign(state[globalUpdateId].todo, {[params.value.id]: params.value})
      // update progress
      let total   = Object.keys(state[globalUpdateId].todo).length
      let checked = 0
      Object.keys(state[globalUpdateId].todo).forEach(
        function(index,val,arr) {
          if (state[globalUpdateId].todo[index].done) {
            checked++
          }
        }
      );
      state[globalUpdateId].progress = (checked.toFixed(2) / total.toFixed(2)) * 100
      return {}
    },

    changeTodoTitle: (params)=>(state)=>{
      globalUpdateId = params.id;
      state[globalUpdateId].todo[params.value.id].title = params.value.title
      return {}
    },

    changeTodoStatus: (params)=>(state)=>{
      globalUpdateId = params.id;
      state[globalUpdateId].todo[params.value.id].done = params.value.status
      let total   = Object.keys(state[globalUpdateId].todo).length
      let checked = 0
      Object.keys(state[globalUpdateId].todo).forEach(
        function(index,val,arr) {
          if (state[globalUpdateId].todo[index].done) {
            checked++
          }
        }
      );
      state[globalUpdateId].progress = (checked.toFixed(2) / total.toFixed(2)) * 100
      return {}
    },

    deleteTodo: (params)=>(state)=>{
      globalUpdateId = params.id;
      delete(state[globalUpdateId].todo[params.value])
      let total   = Object.keys(state[globalUpdateId].todo).length
      let checked = 0
      Object.keys(state[globalUpdateId].todo).forEach(
        function(index,val,arr) {
          if (state[globalUpdateId].todo[index].done) {
            checked++
          }
        }
      );
      state[globalUpdateId].progress = (checked.toFixed(2) / total.toFixed(2)) * 100
      return {}
    },

    // comment
    changeComment: (params)=>(state)=>{
      globalUpdateId = params.id;
      let updatedComment = Object.assign(state[globalUpdateId].comment, {[params.value.id]: params.value})
      return {}
    },

    deleteComment: (params)=>(state)=>{
      globalUpdateId = params.id;
      delete(state[globalUpdateId].comment[params.value])
      return {}
    },

    changeMember: (params) => (state, actions) => {
      globalUpdateId = params.id;
      state[globalUpdateId].member = params.member 
      return {}
    },

    changeDescription: (params) => (state, actions) => {
      globalUpdateId = params.id;
      state[globalUpdateId].description = params.description
      return {}
    },

    changeTitle: (params) => (state, actions) => {
      state[params.id].title = params.title
      return {}
    },

    add: (globalState) => (state) => {

      //window.his() くそ重くなるので一旦はずす

      let id = Number(Object.keys(state)[Object.keys(state).length -1]) + 1

      let tempDate     = new Date()
      let start        = Math.abs(utils.getDateDiff(utils.getDateStr(tempDate), utils.getDateStr(window.startDate))) + 1
      let addStartDate = window.startDate.getDate()

      state[id] = 
      { 
          id:             id,
          display:        "",
          title:          "Added task",
          description:    "",
          member:         [],
          todo:           {},
          comment:        {},
          progress:       0,
          startPosition:  start * globalState.globalCellWidth,
          endPosition:    (start * globalState.globalCellWidth) + (2*globalState.globalCellWidth),
          width:          2 * globalState.globalCellWidth-1,
          pageX:          0,
          startDate:      utils.get_date(start * globalState.globalCellWidth, globalState.globalCellWidth, window.startDate),
          endDate:        utils.get_date((start * globalState.globalCellWidth)+(2 * globalState.globalCellWidth-1), globalState.globalCellWidth, window.startDate),
      }
      utils.smoothScroll()
      return {}
    }, 

    del: (id) => (state, actions) => {
      delete(state[id])
      return {}
    }, 

    changePositioning: (params) => (state, actions) => {
      if (globalUpdateId != params.id) {
        params.e.preventDefault()
      }
    },

    changePosition: (params) => (state, actions) => {
      if (params.e.dataTransfer.getData("text") != params.id) {
        const sourceId = parseInt(params.e.dataTransfer.getData("text"))
        const source   = JSON.parse(JSON.stringify(state[sourceId]))
        const target   = JSON.parse(JSON.stringify(state[params.id]))
        source.id      = params.id
        source.display = ""
        state[params.id] = source
        target.id = sourceId
        state[sourceId] = target
        return {}
      }
    },

    dragEnd: (params) => (state, actions) => {

      const [e, globalState, globalUpdateId, pageXPoint] = params

      e.preventDefault();
      let startPosition = 0
      if (e.pageX > pageXPoint) {
        startPosition = utils.widthResized((e.pageX - pageXPoint), globalState.globalCellWidth) + state[globalUpdateId].startPosition
      } else {
        startPosition = state[globalUpdateId].startPosition - utils.widthResized((pageXPoint - e.pageX), globalState.globalCellWidth)
      }
      state[globalUpdateId].startPosition = startPosition
      state[globalUpdateId].endPosition   = startPosition + state[globalUpdateId].width
      state[globalUpdateId].startDate     = utils.get_date(startPosition, globalState.globalCellWidth, window.startDate)
      state[globalUpdateId].endDate       = utils.get_date(startPosition + state[globalUpdateId].width, globalState.globalCellWidth, window.startDate)
      return {}
    },

    startPointResizeEnd: (params) => (state, actions) => {

      const [e, globalState, globalUpdateId, pageXPoint] = params

        e.preventDefault();
        let pageX = e.pageX;

        resizeStartingPoint = ""
        let startPosition = 0
        if (e.pageX > pageXPoint) {
          startPosition = utils.widthResized((e.pageX - pageXPoint), globalState.globalCellWidth) + state[globalUpdateId].startPosition
        } else {
          startPosition = state[globalUpdateId].startPosition - utils.widthResized((pageXPoint - e.pageX), globalState.globalCellWidth)
        }

        let width         = state[globalUpdateId].endPosition - startPosition
        let endPosition   = width + startPosition

        // 1日分よりは小さくならない様にする
        if ((state[globalUpdateId].endPosition - pageX) <= globalState.globalCellWidth) {
          startPosition = state[globalUpdateId].endPosition - globalState.globalCellWidth
          width         = globalState.globalCellWidth
          endPosition   = width + startPosition
        }

        state[globalUpdateId].startPosition = startPosition
        state[globalUpdateId].endPosition   = endPosition
        state[globalUpdateId].startDate     = utils.get_date(startPosition, globalState.globalCellWidth, window.startDate)
        state[globalUpdateId].endDate       = utils.get_date(startPosition + width -1, globalState.globalCellWidth, window.startDate)
        state[globalUpdateId].width         = width -1
        return {}

    },


    endPointResizeEnd: (params) => (state, actions) => {

      const [e, globalState, globalUpdateId, pageXPoint] = params

        e.preventDefault();
        let pageX = e.pageX;

        resizeStartingPoint = ""

        let width = 0
        if (e.pageX > pageXPoint) {
          width = utils.widthResized((e.pageX - pageXPoint), globalState.globalCellWidth) + state[globalUpdateId].width
        } else {
          width = state[globalUpdateId].width - utils.widthResized((pageXPoint - e.pageX), globalState.globalCellWidth)
        }

        // 1日分よりは小さくならない様にする
        if (width == 0) {
          width = globalState.globalCellWidth
        }

        state[globalUpdateId].width       = width
        state[globalUpdateId].endPosition = state[globalUpdateId]["startPosition"] + width
        state[globalUpdateId].endDate     = utils.get_date(state[globalUpdateId]["startPosition"] + width -1, globalState.globalCellWidth, window.startDate)
        return {}

    }
  },
}