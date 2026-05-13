点$\mathbf{v}=(x,y,z)\in\mathbb{R}^3$を球面座標$(r,\theta,\phi)　(r=|\mathbf{v}|,\theta=\arctan(\frac{y}{x}),\phi=\arcsin(\frac{z}{r}))$
で表したとき、冪乗を以下のように定義します。

$\mathbf{v}^n = r^n(\sin(n\phi)\cos(n\theta),\sin(n\phi)\sin(n\theta),\cos(n\phi))$

この演算を用いて、マンデルバルブの反復写像を次式で定義します。

$\mathbf{v}_{k+1} = \mathbf{v}_k^n + \mathbf{c}$

ここで$\mathbf{c}\in\mathbb{R}^3$は初期点（定数）、$\mathbf{v}_0 = \bm{0}$です。点$\mathbf{c}$がマンデルバルブに属するのは、この軌跡列{$\mathbf{v}_k$}が有界　($|\mathbf{v}_k| \nrightarrow \infty$)
であるときに定義されます。実用上は$|\mathbf{v}_k|>2$になった時点で発散と判定します（Bailout条件）。
標準的な次数は$n=8$であり、これが最も「マンデルブロ集合らしい」形状を与えることが経験的に知られています。