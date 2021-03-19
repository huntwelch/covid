const layers = 3 // Major performance loss with each addition
const high = 3000 // High is about 81000 with a sharp drop off, mean is ~320
const colorbase = 68
const colorrange = 170

const colorfloor = 255 - colorrange

const access = []

const drawcounty = (map, county, style) => {
    const path = map.path(county[2]);
    path.id = county[0];
    path.name = county[1];
    path.attr(style);
    return path
}

const drawcounties = (id, style, index=null) => {
  const map = Raphael(id, 1030, 800)
  const _counties = [ ...counties ]
  while(counties) { 
    const county = _counties.pop()

    if( !county ) break

    const path = drawcounty(map, county, style)

    if( index ) {
      access[index][county[0]] = path
    }
  }
}

for( i = 0; i < layers; i++ ) {
  document.getElementsByClassName('container')[i].style.opacity = 1 / layers
  access.push({})
  const basestyle = {
    stroke: `rgb(0, 0, 0)`,
    fill: `rgb(${colorbase}, ${colorbase}, ${colorbase})`,
    "stroke-width": "0.2",
  }
  drawcounties(`map_${i+1}`, basestyle, i)
}

const drawmask = () => {
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
    drawcounty(map, county, maskstyle)
  }
}
drawmask()

const newyork = ['36005', '36047', '36061', '36081', '36085']
const hoonah = ['02270', '02282']
const bristol = ['02282', '02060']

let maskit = false

const update = (date=null, index=null) => {
  const dt = moment(date).format('YYYY-MM-DD')
  if( !casesbydate[dt] ) return

  for( const id in access[index] ) {

    let set = null
    let fakeid = null

    if( newyork.includes(id) ) {
      set = newyork 
      fakeid = '00000'
    }
    else if( hoonah.includes(id) ) {
      set = hoonah
      fakeid = '11111'
    }
    else if( bristol.includes(id) ) {
      set = bristol
      fakeid = '22222'
    }

    if( !casesbydate[dt][fakeid || id] ) {
      const floorfill = { fill: `rgb(${colorbase}, ${colorbase}, ${colorbase})` }
      if( !set ) {
        access[index][id].attr(floorfill)
      } else {
        set.forEach(item => {
          access[index][item].attr(floorfill)
        })
      }
      continue
    }

    const { pop, cases } = casesbydate[dt][fakeid || id]
    let percentage = parseInt(cases / pop * 1000000)

    if( percentage === Infinity ) continue
    if( percentage === 0 ) percentage = 1
    if( percentage < 0 ) percentage = 1

    if( percentage > high ) {
      const maxfill = { fill: `rgb(255, 0, 0)` }
      if( !set ) {
        access[index][id].attr(maxfill)
      } else {
        set.forEach(item => {
          access[index][item].attr(maxfill)
        })
      }
      continue
    } 

    let coloradj = parseInt(colorrange * 2 * percentage / high)
    let nextadj = 0
    if (coloradj > colorrange) {
      nextadj = coloradj - colorrange 
      coloradj = colorrange
    }

    let red = colorfloor + coloradj
    let green = colorfloor + coloradj - nextadj

    const fill = { fill: `rgb(${red}, ${green}, ${colorfloor})` }

    if( !set ) {
      access[index][id].attr(fill)
    } else {
      set.forEach(item => {
        access[index][item].attr(fill)
      })
    }               
  }
}

const formatdate = (date) => {
  return moment(date).format("MMM Do YYYY");
}

const display = document.getElementById('display')

const dates = []
const dt = new Date("2020-01-21")
const end = new Date("2021-03-17")

display.innerHTML = formatdate(dt)
while (dt <= end) {
  dates.push(new Date(dt));
  dt.setDate(dt.getDate() + 1);
}

let index = 0
const dragger = new Dragdealer('bar', {
  animationCallback: function(x, y) {
    let index = parseInt(dates.length * x) - 1
    if( index < 0 ) {
      index = 0
    }
    const date = dates[index]
    update(date, ++index%layers)
    display.innerHTML = formatdate(date)
  }
});

let playing = false
const play = () => {
  if( !playing ) return
  const val = 1 / dates.length
  dragger.setValue(dragger.getValue()[0] + val)
  if( dragger.getValue()[0] === 1 && playing ) {
    playtoggle()
  }
  setTimeout(play, 100)
}

const playpause = document.getElementById('playpause')

const playtoggle = () => {
  playing = !playing
  playpause.innerHTML = playing ? '&#10074;&#10074;' : '&#9658;'
  play()
}

playpause.addEventListener('click', (event) => {
  playtoggle()
})

const masktoggle = document.getElementById('masktoggle')
const maskicon = document.getElementById('maskicon')
const masklayer = document.getElementById('mask_map')

const togglemask = () => {
  if( playing ) {
    playtoggle()
  }
  maskit = !maskit
  maskicon.innerHTML = maskit ? '&#8777;' : '&#8776;'
  masklayer.style.display = maskit ? 'block' : 'none'
}

masktoggle.addEventListener('click', (event) => {
  togglemask()
})

window.addEventListener('keydown', (event) => {
  if( event.keyCode === 39 ) {
    if( playing ) {
      playtoggle() 
    }
    const val = 1 / dates.length
    dragger.setValue(dragger.getValue()[0] + val)
  }
  if( event.keyCode === 37 ) {
    if( playing ) {
      playtoggle() 
    }
    const val = 1 / dates.length
    dragger.setValue(dragger.getValue()[0] - val)
  }
  if( event.keyCode === 80 ) {
    playtoggle()
  }
})


