import { Inter, Lusitana } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700'],  // required!
});

export const lusitana = Lusitana({
  subsets: ['latin'],
  weight: ['400', '700'],  // required!
});


// <p className={`${lusitana.className} font-bold text-xl`}>
//   This uses Lusitana at weight 700 (bold).
// </p>
// <p className={`${lusitana.className} font-normal text-xl`}>
//   This uses Lusitana at weight 400 (regular).
// </p>
