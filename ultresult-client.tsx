[33mcommit 15713d808d78bca11d190e63776127b0a88f699e[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m, [m[1;31morigin/main[m[33m)[m
Author: Carlos Machado <60036250+capmachado@users.noreply.github.com>
Date:   Wed Apr 29 09:24:05 2026 -0300

    Fix definitivo tipagem photo

[1mdiff --git a/app/result/result-client.tsx b/app/result/result-client.tsx[m
[1mindex 40d40d0..2a9bd20 100644[m
[1m--- a/app/result/result-client.tsx[m
[1m+++ b/app/result/result-client.tsx[m
[36m@@ -10,7 +10,7 @@[m [mexport default function ResultClient() {[m
   useEffect(() => {[m
     const savedPhoto = sessionStorage.getItem("dogze_pet_photo");[m
 [m
[31m-    if (savedPhoto) {[m
[32m+[m[32m    if (savedPhoto !== null) {[m
       setPhoto(savedPhoto);[m
     }[m
   }, []);[m
