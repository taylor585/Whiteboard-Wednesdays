## Table A: descriptive statistics (median [IQR] (n) or count/n)

| creator | sample | n | length | first line chars | keyword (analyst) in first 150 | title word in first 150 | links (total) | URLs above fold | first link line | hashtags>0 | hashtag median | chapters | CTA on line 1 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| nick | latest30 | 30 | 3,494 [3,233–3,890] (n=30) | 85 [85–85] (n=30) | 1/30 | 3/30 | 2 [2–5] (n=30) | 2 [2–2] (n=30) | 1 [1–1] (n=30) | 0/30 | 0 | 24/30 | 30/30 |
| nick | top20 | 20 | n/a (n=0) | 85 [68–85] (n=20) | n/a (n=0) | 5/20 | n/a (n=0) | 1 [1–2] (n=20) | 1 [1–2] (n=18) | 0/20 | 0 | 16/20 | 18/20 |
| riley | latest30 | 30 | 944 [632–1,296] (n=30) | 65 [32–118] (n=30) | 13/30 | 22/30 | 1 [0–2] (n=30) | 0 [0–1] (n=30) | 3 [3–5] (n=24) | 7/30 | 0 | 29/30 | 4/30 |
| riley | top20 | 20 | 1,058 [876–1,706] (n=20) | 64 [37–89] (n=20) | n/a (n=0) | 18/20 | n/a (n=0) | 0 [0–1] (n=20) | 2 [1–2] (n=9) | 1/20 | 0 | 18/20 | 3/20 |
| sabri | latest30 | 30 | 312 [242–355] (n=30) | 94 [83–116] (n=30) | 14/30 | 22/30 | 5 [4–5] (n=30) | 1 [0–1] (n=30) | 3 [3–3] (n=30) | 0/30 | 0 | 0/30 | 2/30 |
| sabri | top20 | 20 | 1,101 [366–2,118] (n=20) | 52 [52–122] (n=20) | n/a (n=0) | 6/20 | n/a (n=0) | 0 [0–1] (n=20) | 2 [1–2] (n=5) | 13/20 | 1 | 1/20 | 2/20 |

## Table B: median outlier, feature high/present vs low/absent (median split for numbers)

| creator | sample | length | first_line_len | kw_in_150 | title_word_in_150 | links | first_link_line | hashtags | chapters | cta_line1 |
|---|---|---|---|---|---|---|---|---|---|---|
| nick | latest30 | 0.84 (n=15) vs 0.59 (n=15) | 0.37 (n=1) vs 0.84 (n=29) | 0.84 (n=1) vs 0.79 (n=29) | 0.84 (n=3) vs 0.79 (n=27) | 0.58 (n=12) vs 1.04 (n=18) | no split (all no, n=30) | no split (all no, n=30) | 0.69 (n=24) vs 1.08 (n=6) | no split (all yes, n=30) |
| nick | top20 | n/a | 8.39 (n=2) vs 8.46 (n=18) | n/a | 6.62 (n=5) vs 9.22 (n=15) | n/a | 7.70 (n=7) vs 9.22 (n=11) | no split (all no, n=20) | 9.75 (n=16) vs 6.64 (n=4) | 8.46 (n=18) vs 8.39 (n=2) |
| riley | latest30 | 0.92 (n=15) vs 1.12 (n=15) | 0.77 (n=15) vs 1.11 (n=15) | 0.77 (n=13) vs 1.12 (n=17) | 0.90 (n=22) vs 1.25 (n=8) | 0.58 (n=9) vs 1.12 (n=21) | 1.11 (n=9) vs 0.41 (n=15) | 0.58 (n=7) vs 1.11 (n=23) | 1.11 (n=29) vs 0.18 (n=1) | 0.21 (n=4) vs 1.12 (n=26) |
| riley | top20 | 9.45 (n=10) vs 6.86 (n=10) | 6.73 (n=10) vs 9.55 (n=10) | n/a | 7.55 (n=18) vs 11.89 (n=2) | n/a | no split (all no, n=9) | 2.61 (n=1) vs 7.57 (n=19) | 7.55 (n=18) vs 7.77 (n=2) | 7.54 (n=3) vs 7.57 (n=17) |
| sabri | latest30 | 1.43 (n=15) vs 0.56 (n=15) | 1.06 (n=15) vs 1.06 (n=15) | 1.49 (n=14) vs 0.69 (n=16) | 1.25 (n=22) vs 0.63 (n=8) | 4.62 (n=2) vs 1.06 (n=28) | 0.56 (n=1) vs 1.06 (n=29) | no split (all no, n=30) | no split (all no, n=30) | 8.64 (n=2) vs 0.91 (n=28) |
| sabri | top20 | 30.25 (n=10) vs 12.96 (n=10) | 14.09 (n=9) vs 27.58 (n=11) | n/a | 25.49 (n=6) vs 16.49 (n=14) | n/a | no split (all no, n=5) | 35.45 (n=9) vs 13.85 (n=11) | 84.55 (n=1) vs 15.53 (n=19) | 28.18 (n=2) vs 17.33 (n=18) |

## Table C: Spearman rho with outlier (rho, n)

| creator | sample | length | first_line_len | links | links_in_fold | first_link_line | hashtags | chapter_count |
|---|---|---|---|---|---|---|---|---|
| nick | latest30 | +0.03 (n=30) | +0.00 (n=30) | -0.14 (n=30) | +0.20 (n=30) | n/a (n=30) | n/a (n=30) | -0.05 (n=30) |
| nick | top20 | n/a (n=0) | +0.03 (n=20) | n/a (n=0) | +0.07 (n=20) | +0.03 (n=18) | n/a (n=20) | +0.06 (n=20) |
| riley | latest30 | -0.12 (n=30) | -0.24 (n=30) | -0.32 (n=30) | -0.10 (n=30) | +0.39 (n=24) | -0.07 (n=30) | +0.21 (n=30) |
| riley | top20 | +0.22 (n=20) | -0.20 (n=20) | n/a (n=0) | -0.04 (n=20) | +0.09 (n=9) | -0.38 (n=20) | +0.32 (n=20) |
| sabri | latest30 | +0.24 (n=30) | +0.10 (n=30) | +0.38 (n=30) | +0.35 (n=30) | -0.38 (n=30) | n/a (n=30) | n/a (n=30) |
| sabri | top20 | +0.51 (n=20) | -0.23 (n=20) | n/a (n=0) | -0.33 (n=20) | -0.58 (n=5) | +0.39 (n=20) | +0.38 (n=20) |

## Table D: latest30 sensitivity, newest 5 uploads dropped (median outlier split)

| creator | length | first_line_len | kw_in_150 | title_word_in_150 | links | first_link_line | hashtags | chapters | cta_line1 |
|---|---|---|---|---|---|---|---|---|---|
| nick (n=25) | 0.81 (n=12) vs 0.94 (n=13) | 0.37 (n=1) vs 0.89 (n=24) | 0.84 (n=1) vs 0.86 (n=24) | 1.50 (n=2) vs 0.79 (n=23) | 0.59 (n=11) vs 1.04 (n=14) | no split (all no, n=25) | no split (all no, n=25) | 0.79 (n=19) vs 1.08 (n=6) | no split (all yes, n=25) |
| riley (n=25) | 0.75 (n=12) vs 1.12 (n=13) | 0.59 (n=12) vs 1.12 (n=13) | 0.41 (n=11) vs 1.17 (n=14) | 0.88 (n=19) vs 1.61 (n=6) | 0.58 (n=7) vs 1.14 (n=18) | 1.16 (n=7) vs 0.29 (n=12) | 0.58 (n=5) vs 1.02 (n=20) | 1.02 (n=24) vs 0.18 (n=1) | 0.21 (n=4) vs 1.12 (n=21) |
| sabri (n=25) | 2.51 (n=12) vs 0.62 (n=13) | 1.25 (n=12) vs 1.30 (n=13) | 1.77 (n=10) vs 0.75 (n=15) | 1.55 (n=17) vs 0.63 (n=8) | 3.54 (n=12) vs 0.56 (n=13) | no split (all no, n=25) | no split (all no, n=25) | no split (all no, n=25) | 8.64 (n=2) vs 1.06 (n=23) |

## Table E: opening-text source used for first-150 metrics

| creator | sample | full_text | above_fold | first_line only | opening shorter than 150 chars |
|---|---|---|---|---|---|
| nick | latest30 | 0 | 30 | 0 | 6 |
| nick | top20 | 0 | 20 | 0 | 9 |
| riley | latest30 | 5 | 0 | 25 | 22 |
| riley | top20 | 0 | 20 | 0 | 7 |
| sabri | latest30 | 0 | 30 | 0 | 15 |
| sabri | top20 | 0 | 20 | 0 | 4 |
