// Lightweight decorative sky; theme follows the site's Day / Night / Auto control.
for (const host of document.querySelectorAll('.minecraft-landscape')) {
  host.classList.add('sky-only');
  const sun=document.createElement('div');sun.className='sky-sun';host.append(sun);
  const moon=document.createElement('div');moon.className='sky-moon';host.append(moon);
  const stars=document.createElement('div');stars.className='sky-stars';
  let seed=721;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  for(let i=0;i<85;i++){const star=document.createElement('i');star.style.cssText=`left:${random()*100}%;top:${random()*85}%;opacity:${.3+random()*.7};width:${i%5===0?3:2}px;height:${i%5===0?3:2}px`;stars.append(star);}host.append(stars);
  for(let i=0;i<7;i++){const cloud=document.createElement('div');cloud.className='sky-cloud';cloud.style.cssText=`--x:${[-14,18,64,88,-8,48,78][i]}%;--y:${[15,34,21,48,68,76,89][i]}%;--scale:${[1.4,.7,1.1,.65,1,.8,1.5][i]};--duration:${100+i*13}s;--delay:-${i*9}s`;host.append(cloud);}
}
