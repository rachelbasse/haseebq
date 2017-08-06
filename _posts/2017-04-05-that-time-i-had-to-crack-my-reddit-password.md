---
tags: [programming, effective altruism, blockchain]
title: That Time I Had to Crack My Reddit Password
---

**I have no self-control.**

Luckily, I know this about myself. This allows me to consciously engineer my life so that despite having the emotional maturity of a heroin-addicted lab rat, I'm occasionally able to get things done.

![](https://media.giphy.com/media/gOH54eiriYIwM/giphy.gif)
<div class="caption">Mm, a waste of time!</div>

I waste a lot of time on Reddit. If I want to procrastinate on something, I'll often open a new tab and dive down a Reddit-hole. But sometimes one needs to turn on the blinders and dial down distractions. 2015 was one of these times&mdash;I was singularly focused on improving as a programmer, and Redditing was becoming a liability.

I needed an abstinence plan.

```python
def f(x, y):
  return map(x, y)
```

So it occurred to me: how about I lock myself out of my account? 

<div class="ui embed" data-url="https://www.youtube.com/embed/zI-riJZiY7s">[video]</div>

## Here's what I did:

![](https://cdn-images-1.medium.com/max/800/1*8Zpw3ipnu92ehqA_6T-o8w.gif)

I set a random password on my account. Then I asked a friend to e-mail me this password on a certain date. With that, I'd have a foolproof way to lock myself out of Reddit. (Also changed the e-mail for password recovery to cover all the bases.)

This should have worked.

Unfortunately it turns out, friends are very susceptible to social engineering. The technical terminology for this is that they are &ldquo;nice to you&rdquo; and will give you back your password if you &ldquo;beg them.&rdquo;

Once the process terminates, I should be able to reconstruct the password. In total, I'll need to figure out `L` characters (where `L` is the length), and need to expend on average `A/2` guesses per character (where `A` is the alphabet size), so total guesses = `A/2 \* L`.

To be precise, I also have to add another `2A` to the number of guesses for ascertaining that the string has terminated on each end. So the total is `A/2 \* L + 2A`, which we can factor as `A(L/2 + 2)`.

Let's assume we have 20 characters in our password, and an alphabet consisting of `a-z` (26) and `0–9` (10), so a total alphabet size of 36. So we're looking at an average of `36 \* (20/2 + 2) = 36 \* 12 = 432` iterations.

## The Implementation

First things first: I need to write a client that can programmatically query the search box. This will serve as my substring oracle. Obviously this site has no API, so I'll need to scrape the website directly.

Looks like the URL format for searching is just a simple query string, `www.lettermelater.com/account.php?**qe=#{query_here}**`. That's easy enough.

Let's start writing this script. I'm going to use the Faraday gem for making web requests, since it has a simple interface that I know well.

I'll start by making an API class.

<script src="https://gist.github.com/Haseeb-Qureshi/b34b7e50009ca20511abaf9e4c7e2aab.js"></script><noscript>View the code on [Gist](https://gist.github.com/Haseeb-Qureshi/b34b7e50009ca20511abaf9e4c7e2aab).</noscript>

Of course, we don't expect this to work yet, as our script won't be authenticated into any account. As we can see, the response returns a 302 redirect with an error message provided in the cookie.

```ruby
[10] pry(main)> Api.get("foo")
=> #<:response:0x007fc01a5716d8>
...
{"date"=>"Tue, 04 Apr 2017 15:35:07 GMT",
"server"=>"Apache",
"x-powered-by"=>"PHP/5.2.17",
"set-cookie"=>"msg_error=You+must+be+signed+in+to+see+this+page.",
"location"=>".?pg=account.php",
"content-length"=>"0",
"connection"=>"close",
"content-type"=>"text/html; charset=utf-8"},
status=302></:response:0x007fc01a5716d8>
```

So how do we sign in? We need to send in our [cookies](http://stackoverflow.com/questions/17769011/how-does-cookie-based-authentication-work) in the header, of course. Using Chrome inspector we can trivially grab them.

![](https://cdn-images-1.medium.com/max/800/1*PSxZtW4wppyzRXMdBWgGWw.gif)

(Not going to show my real cookie here, obviously. Interestingly, looks like it's storing `user_id` client-side which is always a great sign.)

Through process of elimination, I realize that it needs both `code` and `user_id` to authenticate me&hellip;sigh.

So I add these to the script. (This is a fake cookie, just for illustration.)

<script src="https://gist.github.com/Haseeb-Qureshi/8eaaf329895f3dc64a069b7f2c0a0197.js"></script><noscript>View the code on [Gist](https://gist.github.com/Haseeb-Qureshi/8eaaf329895f3dc64a069b7f2c0a0197).</noscript>

```ruby
[29] pry(main)> Api.get("foo")
=> "\n<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\"\"http://www.w3.org/TR/html4/strict.dtd\">\n<html>\n<head>\n\t<meta http-equiv=\"content-type\" content=\"text/html; charset=UTF-8\" />\n\t<meta name=\"Description\" content=\"LetterMeLater.com allows you to send emails to anyone, with the ability to have them sent at any future date and time you choose.\" />\n\t<meta name=\"keywords\" content=\"schedule email, recurring, repeating, delayed, text messaging, delivery, later, future, reminder, date, time, capsule\" />\n\t<title>LetterMeLater.com — Account Information</title>…
[30] pry(main)> _.include?("Haseeb")
=> true
```

It's got my name in there, so we're definitely logged in!

We've got the scraping down, now we just have to parse the result. Luckily, this pretty easy&mdash;we know it's a hit if the e-mail result shows up on the page, so we just need to look for any string that's unique when the result is present. The string &ldquo;password&rdquo; appears nowhere else, so that will do just nicely.=op

![](https://cdn-images-1.medium.com/max/800/1*cZT37Ji9j8sm8dobFpiAWQ.png)

<script src="https://gist.github.com/Haseeb-Qureshi/4db364c7432730e4f432c3ea3dcac9bc.js"></script><noscript>View the code on [Gist](https://gist.github.com/Haseeb-Qureshi/4db364c7432730e4f432c3ea3dcac9bc).</noscript>

That's all we need for our API class. We can now do substring queries entirely in Ruby.

```ruby
[31] pry(main)> Api.include?('password')
=> true
[32] pry(main)> Api.include?('f')
=> false
[33] pry(main)> Api.include?('g')
=> true
```

Now that we know that works, let's stub out the API while we develop our algorithm. Making HTTP requests is going to be really slow and we might trigger some rate-limiting as we're experimenting. If we assume our API is correct, once we get the rest of the algorithm working, everything should just work once we swap the real API back in.

So here's the stubbed API, with a random secret string:

<script src="https://gist.github.com/Haseeb-Qureshi/07630885b15348da15c92835860d5415.js"></script><noscript>View the code on [Gist](https://gist.github.com/Haseeb-Qureshi/07630885b15348da15c92835860d5415).</noscript>

Wow.

It&hellip;actually worked.

Recall our original formula for the number of iterations: `A(N/2 + 2)`. The true password was 22 characters, so our formula would estimate `36 \* (22/2 + 2) = 36 \* 13 = 468` iterations. Our real password took 443 iterations, so our estimate was within 5% of the observed runtime.

**Math.**

![](https://media.giphy.com/media/26xBI73gWquCBBCDe/giphy.gif)

**It works.**

Embarrassing support e-mail averted. Reddit rabbit-holing restored. It's now confirmed: programming is, indeed, magic.

(The downside is I am now going to have to find a new technique to lock myself out of my accounts.)

And with that, I'm gonna get back to my internet rabbit-holes. Thanks for reading, and share this if you enjoyed it!
