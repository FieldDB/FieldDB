%% mitwpl.cls

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Identification

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{mitwpl}[2008/06/15 v1.0 MITWPL document-class, by Omer Preminger]

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Class Options

\RequirePackage{ifthen}

% Hyphenation
\newboolean{hyphs}
\setboolean{hyphs}{false}

% Double-space
\newboolean{dblspace}
\setboolean{dblspace}{false}

% Print abstract
\newboolean{abstract}
\setboolean{abstract}{false}

% Effects of setting options (i.e., anti-defaults)
\DeclareOption{hyphs}{\setboolean{hyphs}{true}}
\DeclareOption{dblspace}{\setboolean{dblspace}{true}}
\DeclareOption{abstract}{\setboolean{abstract}{true}}

\DeclareOption*{\PassOptionsToClass{\CurrentOption}{article}}

\ProcessOptions \relax

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Package Loading

\LoadClass[twoside]{article}%

\RequirePackage{pstricks}
\RequirePackage{cellspace}

% Set up margins
\RequirePackage[margin=1in]{geometry}

% For headers/footers
\RequirePackage{fancyhdr}

% For formatting headings
\RequirePackage[noindentafter]{titlesec}

% For hyphenation
\RequirePackage[none]{hyphenat}

% Package for IPA characters
\RequirePackage{tipa}

% Babel package
\RequirePackage[english]{babel}

% Package to allow hooks at beginning/end of environments
\RequirePackage{atbeginend}

% For bibliography
\RequirePackage[comma]{natbib}

% To allow unicode LaTeX source
\RequirePackage[utf8]{inputenc}

% Setup font encoding
\RequirePackage[T1]{fontenc}

% To allow \text command (the counterpart of \ensuremath)
\RequirePackage{textcomp}

% Double-spacing
\ifthenelse{\boolean{dblspace}}{%
	\RequirePackage[doublespacing]{setspace}%
}{%
	\newenvironment{singlespacing}{}{\vspace{-.5\baselineskip plus 0pt minus 0pt}}%
}

% Surround parts of graphics with box
\RequirePackage{boxedminipage}

% Package for including code in the document
\RequirePackage{listings}

% This is now the recommended way for checking for PDFLaTeX:
\RequirePackage{ifpdf}

%\newif\ifpdf
%\ifx\pdfoutput\undefined
%\pdffalse % we are not running PDFLaTeX
%\else
%\pdfoutput=1 % we are running PDFLaTeX
%\pdftrue
%\fi

\ifpdf
\RequirePackage[pdftex]{graphicx}
\else
\RequirePackage{graphicx}
\fi

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Main Definitions

% Suppress hyphenation, unless it is turned on in the package options
\ifthenelse{\boolean{hyphs}}{}{
	\hyphenpenalty=10000
	\exhyphenpenalty=5000
	\tolerance=10000
	\hbadness=1000
}

% Set pagination options to discourage dangling lines
\widowpenalty=15999
\clubpenalty=15999
\raggedbottom

% Non-bracketed, non-italic subscripts/superscripts
\catcode`_=\active
\def_#1{{\ensuremath{\rm \sb{#1}}}}
\catcode`^=\active
\def^#1{{\ensuremath{\rm \sp{#1}}}}

% Normal (i.e., non-bold, non-italic, non-underline, etc.) text
\newcommand{\normaltext}[1]{\textnormal{#1}}

% Command to suppress paragraph indentation
\newlength{\origparindent}
\newcommand{\supindent}{\setlength{\origparindent}{\parindent}\setlength{\parindent}{0pt plus 0pt minus 0pt}}

% Custom \hspace command
\newcommand{\hor}[1]{\mbox{\hspace{#1ex}}}

% Month-name as text
\newcommand{\monthname}{\ifcase \month \or January\or February\or March\or April\or May\or June\or July\or August\or September\or October\or November\or December\fi}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Set up style of page

% Commands for setting author, title, forum, venue, and institution
\renewcommand{\author}[1]{\gdef\@author{#1}}
\newcommand{\runningauthor}[1]{\gdef\@runningauthor{#1}}
\newcommand{\papertitle}[1]{\gdef\@papertitle{#1}}
\newcommand{\institution}[1]{\gdef\@institution{#1}}

% Commands for accessing author, title, forum, venue, and institution
\newcommand{\theauthor}{\@author}
\newcommand{\therunningauthor}{\@runningauthor}
\newcommand{\thepapertitle}{\@papertitle}
\newcommand{\theinstitution}{\@institution}

% Default for status of acknowledgements footnote
\newboolean{hasackfn}
\setboolean{hasackfn}{false}

% Acknowledgements footnote
\newcommand{\ackfn}[1]{\setboolean{hasackfn}{true}\gdef\@ackfn{#1}}
\newcommand{\theackfn}{\@ackfn}

% Default for status of separate first title and running title
\newboolean{hasfirsttitle}
\setboolean{hasfirsttitle}{false}
\newboolean{hasrunningtitle}
\setboolean{hasrunningtitle}{false}

% Overriding first title and/or running title
\newcommand{\firsttitle}[1]{\setboolean{hasfirsttitle}{true}\gdef\@firsttitle{#1}}
\newcommand{\thefirsttitle}{\ifthenelse{\boolean{hasfirsttitle}}{\@firsttitle}{\thepapertitle}}
\newcommand{\runningtitle}[1]{\setboolean{hasrunningtitle}{true}\gdef\@runningtitle{#1}}
\newcommand{\therunningtitle}{\ifthenelse{\boolean{hasrunningtitle}}{\@runningtitle}{\thepapertitle}}

% My values...
\author{ERROR --- \textnormal{$\backslash$author} NOT SET!!!}
\runningauthor{ERROR --- \textnormal{$\backslash$runningauthor} NOT SET!!!}
\institution{ERROR --- \textnormal{$\backslash$institution} NOT SET!!!}

% Command for setting the abstract's content
\newcommand{\lingabstract}[1]{\gdef\@abstract{#1}}
\newcommand{\theabstract}{\@abstract}

% Command for printing title of paper
\renewcommand{\maketitle}{%
	\par\strut\vspace{20ex plus 0pt minus 0pt}\strut\par%
	{\supindent%
		\textbf{\textsc{\LARGE \thefirsttitle\ifthenelse{\boolean{hasackfn}}{\symbolfootnote[1]{\theackfn}}{}}}\par\bigskip\bigskip%
		\textsc{\theauthor}\par\emph{\theinstitution}\par\bigskip%
		\ifthenelse{\boolean{abstract}}{%
			\begin{abstract}%
				\theabstract%
			\end{abstract}%
		}{\vspace{-.5\baselineskip plus 0pt minus 0pt}}%
	}%
}

% Set up page-numbering footer, clear all other headers/footers
\pagestyle{fancy}
\fancyhead{}
\fancyfoot{}
\renewcommand{\footrulewidth}{0pt}
\fancyhead[LE]{\thepage}
\fancyhead[RE]{\emph{\therunningauthor}}
\fancyhead[LO]{\emph{\therunningtitle}}
\fancyhead[RO]{\thepage}

% Format section headings
\titlelabel{\thetitle\hor{2}}
\titleformat*{\section}{\Large\bf}%
\titleformat*{\subsection}{\large\bf}%
\titleformat*{\subsubsection}{\large}%
\newcommand{\sectionbreak}{\pagebreak[0]}
\newcommand{\subsectionbreak}{\pagebreak[0]}
\newcommand{\subsubsectionbreak}{\pagebreak[0]}
\titlespacing{\section}{0pt}{2.5ex plus 0pt minus 0pt}{1ex plus 0pt minus 0pt}
\titlespacing{\subsection}{0pt}{2.25ex plus 0pt minus 0pt}{1ex plus 0pt minus 0pt}
\titlespacing{\subsubsection}{0pt}{2.25ex plus 0pt minus 0pt}{1ex plus 0pt minus 0pt}

% Footnotes with symbols (instead of numbers)
\long\def\symbolfootnote[#1]#2{\begingroup
\def\thefootnote{\fnsymbol{footnote}}\footnote[#1]{#2}\endgroup}

% Personalized \Needspace command
% \def\ns#1{\Needspace{#1\baselineskip}}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% List-environments customizations

% Make bullet-lists have sane spacing
\AfterBegin{itemize}{ \setlength{\itemsep}{1pt plus 0pt minus 0pt} \setlength{\parskip}{0pt plus 0pt minus 0pt} \setlength{\parsep}{0pt plus 0pt minus 0pt} }
\AfterBegin{enumerate}{ \setlength{\itemsep}{1pt plus 0pt minus 0pt} \setlength{\parskip}{0pt plus 0pt minus 0pt} \setlength{\parsep}{0pt plus 0pt minus 0pt} }

% Customize bullet symbols
\renewcommand{\labelitemii}{$\circ$}
\renewcommand{\labelitemiii}{--}
\renewcommand{\labelitemiv}{$\cdot$}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Bibliographic customizations

% Generating the bibliography
\bibpunct[:]{(}{)}{,}{a}{,}{,}
\newcommand{\lingbib}[2]{
	\bibliographystyle{mitwpl-bibstyle}
	\renewcommand{\bibfont}{#1}
	\setlength{\bibsep}{#2}
}

\newcommand{\custombib}[1]{%
	\lingbib{\normalsize}{0pt}%
	\ifthenelse{\boolean{dblspace}}{%
		\begin{onehalfspacing}%
			{#1}%
		\end{onehalfspacing}%
	}{%
		{#1}%
	}%
}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Things that must go here...

% For linguistic examples
\RequirePackage{mitwpl-gb4e}

% Choose fonts for document
\RequirePackage{txfonts}%
\RequirePackage{mathptmx}%

\AtBeginDocument{%
	\ifthenelse{\boolean{dblspace}}{%
		\nosinglegloss%
	}{}
	\ifpdf
	\DeclareGraphicsExtensions{.pdf, .jpg, .tif}
	\else
	\DeclareGraphicsExtensions{.eps, .jpg}
	\fi
	\fancypagestyle{plain}{
		\fancyhead{}
		\fancyfoot{}
		\renewcommand{\headrulewidth}{0pt}
		\renewcommand{\footrulewidth}{0pt}
		\fancyfoot[RO]{\thepage}
	}%
	\thispagestyle{plain}%
	\widowpenalty=15999%
	\clubpenalty=15999%
	\raggedbottom%
}

