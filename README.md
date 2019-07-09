## snake-eat-bugs

🐍🐛 A classical and funny, much more challenging snake game.


## Start game

Play online: https://tangbc.github.io/snake-eat-bugs

<img src="https://tangbc.github.io/re-assets/snake-eat-bugs.png" width="404" >


## Game rules

* Snake cannot eat themselves.

* Snake cannot eat bug leftovers.

* Snake cannot over the boundary line.


## Todo list

* [x] Sound effects.

* [x] Scores ranking.

* [x] Mobile side support.

* [x] Prevent bugs trapped area.

* [ ] Improve interval time loop.


## Contributions

[Report a bug](https://github.com/tangbc/snake-eat-bugs/issues) or step to develop:

```
git clone https://github.com/tangbc/snake-eat-bugs.git

cd /snake-eat-bugs

npm install

npm run dev
```

## Some solutions

#### 1. Prevent bugs trapped area

What's the trapped area mean? look at this screenshot:

<img src="https://tangbc.github.io/re-assets/snake-trapped-area.jpg" width="280">

In this condition snake can't eat current bug, so it's a problem. We just need list all conditions of trapped area to fix this bug:

<img src="https://tangbc.github.io/re-assets/snake-avoid-trapped.png" width="444">

Red block is exist bug leftovers, green block is new, if green block will cause these 12 conditions above, we just remove it.

####
