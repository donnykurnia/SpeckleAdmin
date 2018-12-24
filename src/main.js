import Vue from 'vue'
import Axios from 'axios'
import App from './App.vue'
import Router from './router'
import Store from './store'
import './registerServiceWorker'

Vue.config.productionTip = false

// import comps
// NOTE: The VueMaterial in this is specially built to incroporate a fix
// to the router links. See https://github.com/vuematerial/vue-material/pull/1978
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'

Vue.use( VueMaterial )

import VueTimeago from 'vue-timeago'
Vue.use( VueTimeago, { locale: 'en' } )

// Set up the server route.
let server = localStorage.getItem( 'server' )
if ( server )
  Store.state.server = server
// else
//   Store.state.server = `${window.location.origin}/api`


// set default server
Axios.defaults.baseURL = Store.state.server

// Get the token, if any is present.
let token = localStorage.getItem( 'token' )

// Start the init flow
Axios.get( Store.state.server )
  .then( response => {
    Store.state.serverManifest = response.data
    return Axios.get( `${Store.state.server}/accounts?omit=logins`, { headers: { Authorization: token } } )
  } )
  .then( response => {
    // means we're logged out
    if ( response === null ) {
      // TODO
      initApp( )
      return
    }
    // needs to log in
    if ( response.status !== 200 ) {
      // TODO
      initApp( )
      return
    }
    // set defaults in axios, if we got this far things should be fine
    Axios.defaults.headers.common[ 'Authorization' ] = token
    // update the store
    Store.state.isAuth = true
    Store.state.user = response.data.resource
    Store.state.token = token

    initApp( )
  } )
  .catch( err => {
    initApp( )
  } )

// set axios as default $http request lib
Vue.prototype.$http = Axios

// event bus used for triggerring events cross-hirearchy
window.bus = new Vue( )

// get hex color from string global mixin
import CH from 'color-hash'
let ColorHasher = new CH( )
Vue.mixin( {
  methods: {
    getHexFromString: str => ColorHasher.hex( str )
  }
} )

import EditableSpan from './components/EditableSpan.vue'
Vue.component( 'editable-span', EditableSpan )
// Vue.component( 'editable-span', {
//   props: {
//     text: { type: String, default: 'loading...' },
//     disabled: { type: Boolean, default: false },
//     hint: { type: String, default: 'click to edit' },
//   },
//   template: `
//     <span
//       :title='hint'
//       :contenteditable='!disabled'
//       @blur='update'
//       @keydown.enter='update'
//       v-html='getContent()'
//       ></span>
//   `,
//   methods: {
//     getContent( ) {
//       return this.text
//     },
//     update( e ) {
//       let newContent = e.target.innerText.replace( /(\r\n|\n|\r)/gm, " " )
//       if ( this.getContent( ) === newContent ) {
//         e.target.blur( )
//         return
//       }
//       this.text = newContent
//       this.$emit( 'update', newContent )
//     }
//   }
// } )

// The init logic (it's called after we do some auth flows)
let initApp = ( ) => {
  new Vue( {
    router: Router,
    store: Store,
    render: h => h( App )
  } ).$mount( '#app' )
}
