import counties from './data/counties.js'
import casesbydate from './data/covidbydate.js'
import maskusage from './data/maskusage.js'

class Mapper {
  constructor() {
    this.layers = 3 // Major performance loss with each addition
    this.high = 3000 // High is about 81000 with a sharp drop off, mean is ~320
    this.colorbase = 68
    this.colorrange = 170
    this.colorfloor = 255 - this.colorrange

    this.showmaskusage = false
    this.playing = false
    this.index = 0

    this.display = this.dom('display')
    this.playpause = this.dom('playpause')
    this.masktoggle = this.dom('masktoggle')
    this.maskicon = this.dom('maskicon')
    this.masklayer = this.dom('mask_map')

    this.attachevents()

    // This is due to some weird data reporting
    // inconsistentcies in FIPS clumping
    this.sets = {
      // New York City
      '00000': ['36005', '36047', '36061', '36081', '36085'],

      // Alaska areas
      '11111': ['02270', '02282'],
      '22222': ['02282', '02060']
    }
    this.floorfill = { fill: `rgb(${this.colorbase}, ${this.colorbase}, ${this.colorbase})` }
    this.maxfill = { fill: `rgb(255, 0, 0)` }

    this.access = []
    this.maps = document.getElementsByClassName('container')

    
    this.dates = []
    this.dt = new Date("2020-01-21")
    this.end = new Date("2021-03-17")
    
    this.display.innerHTML = this.formatdate(this.dt)
    while (this.dt <= this.end) {
      this.dates.push(new Date(this.dt));
      this.dt.setDate(this.dt.getDate() + 1);
    }
    this.dateincrement = 1 / this.dates.length

    this.initcountymap()
    this.drawmaskusage()

    this.dragger = this.createbar()
  }

  keybind(event) {
    const current = this.dragger.getValue()[0]
    if( event.keyCode === 39 ) {
      if( this.playing ) {
        this.playtoggle() 
      }
      this.dragger.setValue(current + this.dateincrement)
    }
    if( event.keyCode === 37 ) {
      if( this.playing ) {
        this.playtoggle() 
      }
      this.dragger.setValue(current - this.dateincrement)
    }
    if( event.keyCode === 80 ) {
      this.playtoggle()
    }
  }

  attachevents() {
    this.playpause.addEventListener('click', this.playtoggle.bind(this))
    this.masktoggle.addEventListener('click', this.togglemask.bind(this))
    window.addEventListener('keydown', this.keybind.bind(this))
  }

  dom(id) {
    return document.getElementById(id)
  }

  formatdate(date) {
    return moment(date).format("MMM Do YYYY");
  }

  drawcounty(map, county, style) {
    const path = map.path(county[2]);
    path.id = county[0];
    path.name = county[1];
    path.attr(style);
    return path
  }

  initcountymap() {
    for( let index = 0; index < this.layers; index++ ) {
      this.maps[index].style.opacity = 1 / this.layers
      this.access.push({})
      const style = {
        stroke: `rgb(0, 0, 0)`,
        fill: `rgb(${this.colorbase}, ${this.colorbase}, ${this.colorbase})`,
        "stroke-width": "0.2",
      }
    
      const map = Raphael(`map_${index+1}`, 1030, 800)
      const _counties = [ ...counties ]
      while(counties) { 
        const county = _counties.pop()
        if( !county ) break
        const path = this.drawcounty(map, county, style)
        this.access[index][county[0]] = path
      }
    }
  }

  drawmaskusage() {
    const map = Raphael('mask_map', 1030, 800)
    const _counties = [ ...counties ]
    while(counties) { 
      const county = _counties.pop()
  
      if( !county ) break
  
      const maskuse = 255 - maskusage[county[0]]
      const maskstyle = {
        stroke: `rgb(0, 0, 0)`,
        fill: `rgb(${maskuse}, ${maskuse}, 255)`,
        "stroke-width": "0.2",
      }
      this.drawcounty(map, county, maskstyle)
    }
  }

  createbar() {
    const that = this
    return new Dragdealer('bar', {
      animationCallback: function(x, y) {
        that.index = parseInt(that.dates.length * x) - 1
        if( that.index < 0 ) {
          that.index = 0
        }
        const date = that.dates[that.index]
        that.update(date, ++that.index%that.layers)
        that.display.innerHTML = that.formatdate(date)
      }
    });
  }

  getset(id) {
    for( let key in this.sets ) {
      if( this.sets[key].includes(id) ) { 
        return { fakeid: key, set: this.sets[key] }
      }
    }
    return { fakeid: null, set: null }
  }

  cleanpercentage(cases, pop) {
    const percentage = parseInt(cases / pop * 1000000)
    if( percentage === Infinity ) return null
    if( percentage === 0 ) return 1
    if( percentage < 0 ) return  1

    return percentage
  }

  applyfill(index, id, style, set) {
    if( !set ) {
      this.access[index][id].attr(style)
    } else {
      set.forEach(item => {
        this.access[index][item].attr(style)
      })
    }
  }

  update(date, index) {
    const dt = moment(date).format('YYYY-MM-DD')
    if( !casesbydate[dt] ) return
  
    for( const id in this.access[index] ) {
  
      const { fakeid, set } = this.getset(id)
  
      if( !casesbydate[dt][fakeid || id] ) {
        this.applyfill(index, id, this.floorfill, set)
        continue
      }
  
      const { pop, cases } = casesbydate[dt][fakeid || id]
      const percentage = this.cleanpercentage(cases, pop)

      if( !percentage ) continue
  
      if( percentage > this.high ) {
        this.applyfill(index, id, this.maxfill, set)
        continue
      } 
  
      let coloradj = parseInt(this.colorrange * 2 * percentage / this.high)
      let nextadj = 0
      if (coloradj > this.colorrange) {
        nextadj = coloradj - this.colorrange 
        coloradj = this.colorrange
      }
  
      const red = this.colorfloor + coloradj
      const green = this.colorfloor + coloradj - nextadj
  
      const fill = { fill: `rgb(${red}, ${green}, ${this.colorfloor})` }
  
      this.applyfill(index, id, fill, set)
    }
  }

  play() {
    if( !this.playing ) return
    const val = 1 / this.dates.length
    this.dragger.setValue(this.dragger.getValue()[0] + val)
    if( this.dragger.getValue()[0] === 1 && this.playing ) {
      this.playtoggle()
    }
    setTimeout(this.play.bind(this), 100)
  }

  playtoggle() {
    this.playing = !this.playing
    this.playpause.innerHTML = this.playing ? '&#10074;&#10074;' : '&#9658;'
    this.play()
  }

  togglemask() {
    if( this.playing ) {
      this.playtoggle()
    }
    this.showmaskusage = !this.showmaskusage
    this.maskicon.innerHTML = this.showmaskusage ? '&#8777;' : '&#8776;'
    this.masklayer.style.display = this.showmaskusage ? 'block' : 'none'
  }
}

const doit = new Mapper()
